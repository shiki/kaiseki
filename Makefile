export REVOCABLE_SESSION=0

mocha:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha --reporter spec --timeout 30000
