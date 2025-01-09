export class CustomResponse {
  message: string;
  data: string | number | object | null;

  constructor(
    message: string = "",
    data: string | number | object | null = null
  ) {
    this.message = message;
    this.data = data;
  }
}
