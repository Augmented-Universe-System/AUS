#!/bin/bash

echo "Attempting to deploy develop branch at $(date)" >> /home/project/deployment_log.txt

git pull

forever restartall
