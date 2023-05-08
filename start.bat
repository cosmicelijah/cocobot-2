@ECHO off

:start
ECHO "Deploying commands..."
node .\deploy-commands.js

ECHO "Starting bot..."
node .\bot.js

ECHO "Restarting bot..."

GOTO start