#!/bin/bash

echo "Attempting to deploy master branch at $(date)" >> /home/project/deployment_log.txt

git pull

forever restartall
