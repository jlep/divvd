var Ledger = require('../models/ledger');
var currency = require('./currency');
var user = require('./user');
var User = require('../models/user');
var person = require('./person');
var Hox = require('../lib/hox');
var Promise = require('bluebird');
var merge = require('../lib/merge');
var shitorm = require('../lib/shitorm');
var util = require('./util');
var extend = require('../lib/extend');
var qdb = require('../lib/qdb');
var dada = require('../lib/dada');

var dao = module.exports = {};

// Creates a new ledger with a transaction
//
// Creates a new ledger and inserts a new currency as the total value
// currency. Owner is inserted as a person in the ledger.

dao.create = function(props, db) {
  db = db || qdb;
  return db.transaction(function(db) {

    // bind to-be-returned ledger
    return Promise.bind(new Ledger(props)).

    // insert ledger
    then(function() {
      return insert_ledger(this.title, db);
    }).
    then(function(ledger_id) {
      this.ledger_id = ledger_id;
    }).

    // insert currency
    then(function() {
      return currency.create(
        merge(props.total_currency, { ledger_id: this.ledger_id }), db);
    }).
    then(function(currency) {
      currency.active = true;
      this.total_currency_id = currency.currency_id;
      this.currencies = [currency];
    }).

    // insert settings
    then(function() {
      return insert_ledger_settings(this.ledger_id, this.total_currency_id, db);
    }).

    // insert owner
    then(function() {
      return insert_owner(props.user_id, this.ledger_id,
        this.total_currency_id, db);
    }).

    // insert person
    then(function(owner) {
      return user.find(props.user_id, db).
      then(function(usr) {
        usr.currency_id = owner.currency_id;
        return usr;
      });
    }).
    then(function(user) {
      this.owners = [user];
      return person.create({
        name: user.username,
        user_id: user.user_id,
        currency_id: this.total_currency_id,
        ledger_id: this.ledger_id
      }, db);
    }).
    then(function(person) {
      this.persons = [person];
    }).

    then(function() {
      return this; // phew!
    });
  });
};

dao.find = function(ledger_id, db) {
  db = db || qdb;
  return db.transaction(function(db) {
    return Promise.bind(new Ledger({ ledger_id: ledger_id })).

    // select ledger
    then(function() {
      return select_ledger(ledger_id, db);
    }).
    then(function(ledger) {
      extend(this, ledger);
    }).

    // select owners
    then(function() {
      return user.find_by_ledger_id(ledger_id, db);
    }).
    then(function(users) {
      this.owners = users;
    }).

    // select persons
    then(function() {
      return person.find_by_ledger_id(ledger_id, db);
    }).
    then(function(persons) {
      this.persons = persons;
    }).

    // select currencies
    then(function() {
      return currency.find_by_ledger_id(ledger_id, db);
    }).
    then(function(currencies) {
      this.currencies = currencies;
    }).

    then(function() {
      return this;
    });
  });
};

dao.find_by_user_id = dada.array(function(pk, db) {
  return db.query(
      'select title, total_currency_id, ledger_id ' +
      'from ledger natural join ledger_settings natural ' +
      'join owner where user_id = $1;',
      [pk]);
}, Ledger);

dao.update = function(ledger_id, props, db) {
  db = db || qdb;
  return db.transaction(function(db) {
    var ret = new Ledger(props);
    ret.ledger_id = ledger_id;
    var p = Promise.resolve();
    if (props.title) {
      p.then(function() {
        return db.query('update ledger set title = $1 where ledger_id = $2 returning title;',
            [props.title, ledger_id]).
        catch(util.pg_error).
        then(util.first_row).
        then(function(row) {
          ret.title = row.title;
        });
      });
    }
    if (props.total_currency_id) {
      p.then(function() {
        return db.query('update ledger_settings set total_currency_id = $1 where ledger_id = $2;',
            [props.total_currency_id, ledger_id]);
      });
    }
    return p.then(function() {
      return ret;
    });
  });
};

dao.update_owner = function(ledger_id, user_id, props, db) {
  db = db || qdb;
  var set = Object.keys(props).map(function(k, i) {
    return k + ' = $' + (i + 3);
  }).join(', ');
  return db.query('update owner set ' + set +
    ' where ledger_id = $1 and user_id = $2 returning *;',
    [ledger_id, user_id].concat(Object.keys(props).map(function(k) {
      return props[k];
    }))
  ).
  then(util.check_empty).
  then(util.first_row);
}

// \return [user_id]

dao.find_owners = function(ledger_id, db) {
  db = db || qdb;
  return db.query('select user_id from owner where ledger_id = $1;',
      [ledger_id]).
  then(function(result) {
    return result.rows;
  });
};

dao.ledgers_summary = function(user_id, db) {
  db = db || qdb;
  return db.query('select * from ledgers_web_view where user_id = $1 order by ledger_id;',
      [user_id]).
  then(function(result) {
    return result.rows;
  });
};

dao.summary = function(ledger_id, user_id, db) {
  db = db || qdb;
  return db.query('select * from ledger_summary_web_view where ledger_id = $1 and user_id = $2;',
      [ledger_id, user_id]).
  then(util.check_empty).
  then(util.first_row);
};

dao.balances = function(ledger_id, db) {
  db = db || qdb;
  return db.query('select * from balance_web_view where ledger_id = $1 order by rel_user_balance desc;',
      [ledger_id]).
  then(function(result) {
    return result.rows;
  });
};

dao.transactions_summary = function(ledger_id, user_id, db) {
  db = db || qdb;
  return db.query('select * from transactions_web_view where ledger_id = $1 and user_id = $2 order by transaction_id;',
      [ledger_id, user_id]).
  then(function(result) {
    return result.rows;
  });
};

// automatically generated stuff

var orm = shitorm({
  props: [
    'title'
  ],
  pk: 'ledger_id',
  table: 'ledger',
  constructor: Ledger
});

dao.delete = orm.delete;

// private

function insert_ledger(title, db) {
  return db.query('insert into ledger (title) values ($1) returning ledger_id;',
      [title]).
  then(util.first_row).
  then(function(row) {
    return row.ledger_id;
  });
}

function insert_owner(user_id, ledger_id, currency_id, db) {
  return db.query('insert into owner (user_id, ledger_id, currency_id, total_credit_currency_id) values ($1, $2, $3, $3) returning *;',
      [user_id, ledger_id, currency_id]).
  then(util.first_row);
}

function insert_ledger_settings(ledger_id, total_currency_id, db) {
  return db.query('insert into ledger_settings (ledger_id, total_currency_id) values ($1, $2);',
      [ledger_id, total_currency_id]);
}

function select_ledger(ledger_id, db) {
  return db.query('select title, total_currency_id, ledger_id from ledger natural join ledger_settings where ledger_id = $1 limit 1;',
      [ledger_id]).
  then(util.check_empty).
  then(util.first_row).
  then(function(row) {
    return new Ledger(row);
  });
}

dao.owners = dada.array(function(ledger_id, db) {
  return db.query(
      'select user_id from owner where ledger_id = $1;',
      [ledger_id]);
});
