'use strict';

/* Controllers */

app.controller('Ledger', ['$scope', 'ledger', '$q', 'auth', 'transaction',
    '$state',
    function($scope, ledger, $q, auth, transaction, $state) {

  $scope.user = auth.data.user;

	function updateView() {
		var l = $scope.ledger;
		ledger.transactions_summary({
			ledger_id: l.ledger_id
		}).$promise.
		then(function(ts) {
			ts.forEach(function(t) {
				t.total_value_currency = l.currencyMap(t.total_value_currency_id);
				t.user_balance_currency = l.currencyMap(t.user_balance_currency_id);
				t.user_credit_currency = l.currencyMap(t.user_credit_currency_id);
			});
			l.transactions = ts;
			return ledger.summary({
				ledger_id: l.ledger_id
			}).$promise;
		}).
		then(function(s) {
			s.total_value_currency = l.currencyMap(s.total_value_currency_id);
			s.user_balance_currency = l.currencyMap(s.user_balance_currency_id);
			s.user_credit_currency = l.currencyMap(s.user_credit_currency_id);
			l.summary = s;
		});
	}

	$scope.ledger.$promise.
	then(function() {
		updateView();
	});

  $scope.delete = function(t) {
		transaction.delete({
			transaction_id: t.transaction_id
		}).$promise.
		then(updateView);
  };

	$scope.setTitle = function(title) {
		var l = $scope.ledger;
		return ledger.update({
			ledger_id: l.ledger_id
		}, {
			title: title
		}).$promise.
		then(updateView);
	};

  $scope.addTransaction = function() {
    ledger.add_transaction({
      ledger_id: $scope.ledger.ledger_id
    }, {
     // get default values from db 
    }).$promise.
    then(function(t) {
      return $state.go('member.ledger.transaction', {
        ledger_id: $scope.ledger.ledger_id,
        transaction_id: t.transaction_id
      });
    });
  };

  $scope.setBalanceCurrency = function(t, c) {
		transaction.update_summary({
			transaction_id: t.transaction_id
		}, {
			owner_balance_currency_id: c.currency_id
		}).$promise.
		then(updateView);
  };
  $scope.setTotalCurrency = function(t, c) {
		transaction.update_summary({
			transaction_id: t.transaction_id
		}, {
			total_value_currency_id: c.currency_id
		}).$promise.
		then(updateView);
  };
	$scope.setCreditCurrency = function(t, c) {
		transaction.update_summary({
			transaction_id: t.transaction_id
		}, {
			owner_total_credit_currency_id: c.currency_id
		}).$promise.
		then(updateView);
	};

  $scope.setSumBalanceCurrency = function(c) {
		var s = $scope.ledger.summary;
    ledger.update_owner({
      ledger_id: s.ledger_id,
      user_id: s.user_id
    }, {
			currency_id: c.currency_id
    }).$promise.
    then(updateView);
  };
  $scope.setSumTotalCurrency = function(c) {
		var s = $scope.ledger.summary
    ledger.update({
      ledger_id: s.ledger_id
    }, {
      total_currency_id: c.currency_id
    }).$promise.
    then(updateView);
  };
	$scope.setSumCreditCurrency = function(c) {
		var s = $scope.ledger.summary;
    ledger.update_owner({
      ledger_id: s.ledger_id,
      user_id: s.user_id
    }, {
			total_credit_currency_id: c.currency_id
    }).$promise.
    then(updateView);
	};
}]);
