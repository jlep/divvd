begin;
insert into userdata
(username, pass, salt)
values
('test',
-- password 'test'
-- 256 bytes pbkdf2-sha1 with 10000 iterations
E'\\x'
'fb39cd693c02923118dabc19ef6e17cc9b20d10697bfe6da666683275ab8b90f1ea7f47d6cd530'
'36fbc7f6393d23390cd6ecc4c4b8280c51546d1d5a06bc88347bfd8d6e5026de9e9fde92d33e81'
'8a12689593b6dda465478dc744d17f3ed53eb352dacf2232d3cec13a329af9d39b0a06d0f06926'
'9390c022c2ed7ed986c5598a159845734a47f2f5f0138a4b37c6f19274e69f93fc00f11c523588'
'8234072f31f01d54d13daa0295e21a5be8de1782877f0e5e74f29598ee97488d4c0f97d0d0ae13'
'5561fc98079779600cdf4da102ded9b9d121c9c71771db8ef8d7056c299da3a0542f96bfe5ec7d'
'97d507d1e076b859e8e21393ef52d7c52d64d6fa29e0',
-- 64 byte random salt
E'\\x'
'36cd8dad64c6aadf47f00ce3a1d24887a02e76695f7d0cffe62b8324e5ca9d72bd1a844a9b8c76'
'7e98522a8eb2c5f227204435fcdedc3a4623817566dc3cefd5'
);
commit;
