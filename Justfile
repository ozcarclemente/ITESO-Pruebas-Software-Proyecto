default:
	@just --list

install:
	npm install

db-up:
	docker compose up -d

db-create:
	npm run sqlz -- db:create

migrate:
	npm run sqlz -- db:migrate

setup: install db-up db-create migrate

dev:
	npm run dev
