# Tic Tac Toe Example Project

In order to get it working, all you need to do is have docker running, run `docker-compose up` and `yarn prisma:push`.

You will also need to update your .env file within /prisma directory. there is an example. All you need to do is add your ip address. If I am not mistaken you can also just use `DATABASE_URL="postgresql://user001:1Password@db:5432/tictactoe_development"`.

`yarn prisma:push` creates all the necessary tables within your database thanks to Prisma 2.
It should install all your dependencies as well as autogenerate any types necessary.
