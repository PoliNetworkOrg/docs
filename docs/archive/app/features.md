# Features App (in ordine di priorita')

    - Feed Notizie
    - Notifiche da PoliAssocizioni, Polimi, etc...
    - Welcome (con gruppi per semestre e anno)
    - Link a Gruppi (con consigliati in base ai propri interessi)
    - Ricerca Aule Libere con Navigatore (gps)
    - Tol Project (con anche resoconto dei punteggi svolti e grafico dell'andamento dei progressi)
    - Calendario (orari lezioni ed aule)
    - Materiali Scaricabili da Gitlab e WeBeep
    - Voto e commento professori
    - Chat Bot (Polifemo) (server)

# Features da approvare

- PoliMeet (PoliTinder)

# Features Backend

Lista delle API che servono

## Api che ritorna le notizie

Parametri:

- Data inizio pubblicazione notizie
- Data fine pubblicazione notizie (opzionale, se non lo si mette vuol dire fino ad ora)
- Filtro su autori
- Filtro su categorie
- Filtro su titolo

## Api che ritorna i gruppi

Parametri:

- Nome gruppo (obbligatorio)
- Anno scolastico
- Tipo di Corso
- Piattaforma
- Lingua
- Sede

## Api che ritorna le aule libere

Parametri:

- Data e ora inizio
- Data e ora fine
