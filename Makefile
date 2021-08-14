DEPLOY_DIR=deno run --allow-read=. --allow-write=deploy.js https://deno.land/x/deploy_dir@v0.3.2/cli.ts

d:
	npm run clean
	npm run build
	$(DEPLOY_DIR) build -y -o deploy.js
	ls -lh deploy.js
	git add deploy.js
	git commit -m "chore: update deploy.js"

fmt:
	deno fmt pipeline.ts bulbofile.js

.PHONY: d
