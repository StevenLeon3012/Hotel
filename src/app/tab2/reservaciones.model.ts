export class reservaciones{
  constructor(
    public id: string,
    public habitacion: string,
    public idUsuario: string,
    public fechaEntrada: Date,
    public fechaSalida: Date
  ){}
}
