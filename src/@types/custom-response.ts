export class CustomResponse {
  message: string;
  data: string | object | null;

  constructor(message: string = "", data: string | object | null = null) {
    this.message = message;
    this.data = data;
  }
}
