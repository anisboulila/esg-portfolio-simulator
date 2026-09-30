export class HttpTransportError extends Error {
  override readonly name = 'HttpTransportError';

  constructor(readonly status: number) {
    super('La requête HTTP a échoué.');
  }
}