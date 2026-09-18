# ChromaLink Instrument Gateway

The service that sits between chromatography instruments on a customer's lab network and the
ChromaLink Data Portal. It discovers instruments, manages pairing, monitors connection health,
and ingests completed runs - including runs acquired while the gateway was offline.

Hypothetical demonstration software. Not a real product.

## Responsibilities

- Discover instruments advertising on the local network
- Pair an instrument to an organisation and hold the credential
- Report connection health and the reason for any dropped link
- Ingest completed runs and backfill anything acquired while offline, in acquisition order
- Record an audit entry for every state change that affects acquired data

## Layout

    src/instruments/   discovery, pairing, connection health
    src/runs/          ingest and offline backfill
    src/audit/         append-only audit log
    tests/             unit tests
