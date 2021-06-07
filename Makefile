DEPLOY_DIR=deno run --allow-read=. --allow-write=deploy.js https://deno.land/x/deploy_dir@v0.2.3/cli.ts

deploy.js:
	npm run build
	$(DEPLOY_DIR) build -y -o deploy.js
	ls -lh deploy.js

.PHONY: deploy.js
