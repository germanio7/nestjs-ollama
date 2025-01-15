#!/bin/bash

domains=(${SERVER_IP})
email="" # Opcional: puedes agregar tu email aquí para recibir notificaciones de Certbot
staging=0 # Cambia a 1 si estás probando para evitar el límite de solicitudes

rsa_key_size=4096
data_path="./certbot"
config_path="$data_path/conf"
webroot_path="$data_path/www"

if [ -d "$config_path/live/$domains" ]; then
  echo "Certificados ya existen para $domains."
  exit
fi

mkdir -p "$config_path"
mkdir -p "$webroot_path"

echo "Solicitando certificados para $domains..."

# Solicitar certificados
certbot certonly --webroot -w "$webroot_path" \
  --email $email \
  -d $domains \
  --rsa-key-size $rsa_key_size \
  --agree-tos \
  --force-renewal \
  --staging=$staging
