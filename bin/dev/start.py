#!/usr/bin/env python3

"""Serve docs/ locally with nginx, like GitHub Pages does.

The server runs in the background, in the "repare-moi-si-tu-peux-server" container: stop it with bin/dev/stop.py,
read its logs with `docker logs -f repare-moi-si-tu-peux-server`. Running this script again restarts it.
"""

import subprocess
from pathlib import Path

PORT = 25200
PROJECT_DIR = Path(__file__).resolve().parents[2]
CONTAINER = 'repare-moi-si-tu-peux-server'
NGINX_IMAGE = 'nginx:1.30.6-alpine'

def start_server():
    subprocess.run(['docker', 'rm', '--force', CONTAINER], capture_output=True)
    subprocess.run(
        [
            'docker', 'run', '--detach',
            '--name', CONTAINER,
            '--volume', f'{PROJECT_DIR / "docs"}:/usr/share/nginx/html:ro',
            '--volume', f'{PROJECT_DIR / "docker" / "nginx" / "default.conf"}:/etc/nginx/conf.d/default.conf:ro',
            '--publish', f'{PORT}:80',
            NGINX_IMAGE,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
    )
    print(f'Open http://localhost:{PORT} (stop with bin/dev/stop.py)')

def main():
    start_server()

if __name__ == '__main__':
    main()
