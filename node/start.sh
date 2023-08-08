dockerize -wait tcp://$DB_HOST:$DB_PORT

cd app

echo "NODE_ENV: $NODE_ENV"
yarn --freeze-lockfile
if [[ $NODE_ENV == *"dev"* ]]; then
  yarn dev
else
  yarn build_and_start
fi