# Prima installazione su server

```
	sudo apt install dotnet jq unzip certbot
	mkdir PoliFemoBackend && cd PoliFemoBackend
	wget https://raw.githubusercontent.com/PoliNetworkOrg/PoliFemoBackend/main/run.sh
	sudo chmod +x run.sh
	sudo certbot certonly --standalone -d api.polinetwork.org
	mkdir conf.d && cd conf.d
	mkdir https
	sudo openssl pkcs12 -export -out $HOME/PoliFemoBackend/conf.d/https/dev_cert.pfx -inkey /etc/letsencrypt/live/api.polinetwork.org/privkey.pem -in /etc/letsencrypt/live/api.polinetwork.org/cert.pem -certfile /etc/letsencrypt/live/api.polinetwork.org/chain.pem
```

Inserire password a scelta

```
	cd ..
	sudo ./run.sh
```

Poi fare un commit senza uscire dalla sessione SSH, se si riavvia correttamente si può uscire.