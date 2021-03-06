import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { reservaciones } from 'src/app/tab2/reservaciones.model';
import { Usuario } from 'src/app/tab3/user.model';
import { FirebaseServiceService } from 'src/app/tabs/firebase-service.service';
import { HotelService } from '../hotel.service';
import { Habitacion } from '../tab1.model';

@Component({
  selector: 'app-reservacion',
  templateUrl: './reservacion.page.html',
  styleUrls: ['./reservacion.page.scss'],
})
export class ReservacionPage implements OnInit {
  habitacion: Habitacion;
  habitacionId: string;
  form: FormGroup;
  noches = 0;
  reservaciones: reservaciones[] = [];
  usuario: Usuario[];
  constructor(private activatedRoute: ActivatedRoute,
              private hotelService: HotelService,
              private alertCtrl: AlertController,
              private router: Router,
              private firebaseService: FirebaseServiceService) {
        this.hotelService.getReservaciones();
   }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(
      paramMap => {
        if(!paramMap.has('hash')){
          return;
        }
         this.habitacionId = paramMap.get('hash');
         this.habitacion = this.hotelService.getHabitacion(this.habitacionId);
      }
    );
    this.form = new FormGroup({
      fechaEntrada: new FormControl(null, {
        validators: [Validators.required]
      }),
      fechaSalida: new FormControl(null, {
        validators: [Validators.required]
      }),
    });
  }


  reservar(){
    //Valida si el uusario esta logueado para hacer la reservacion
    if(this.firebaseService.userlogued[0] !== undefined){
      this.usuario =  this.firebaseService.userlogued;
    }else{
      this.router.navigate(['tabs/tab3/login-page']);
      return;
    }

    //Valida el formulario
    if(!this.form.valid){
      this.alertCtrl.create({
        header: 'Sin fechas!',
        message: 'Por favor, rellene el formulario',
        buttons: ['Aceptar']
      }).then(
        alertElement =>{
          alertElement.present();
        }
      );
      return;
    }

    const fechaEntrada = new Date(this.form.value.fechaEntrada);
    const fechaSalida = new Date(this.form.value.fechaSalida);
    let j = 0;
    for(let i = 0; i < 1; i++){
      this.hotelService.getReservaciones();
    }
    //Valida que la fecha de entrada sea menor que la de salida
    if(fechaEntrada >= fechaSalida){
      this.alertCtrl.create({
        header: 'Oops!',
        message: 'Fecha de salida mayor a fecha de entrada.',
        buttons: ['Aceptar']
      }).then(
        alertElement =>{
          alertElement.present();
        }
      );
      return;
    }

  this.reservaciones =  this.hotelService.getReservacion(this.habitacionId);

  if(this.reservaciones[0] === undefined) {
    fechaEntrada.setDate(fechaEntrada.getDate() - 1);
    fechaSalida.setDate(fechaSalida.getDate() - 1);
    this.hotelService.agregarReservacion(this.habitacionId, fechaEntrada ,fechaSalida,this.usuario[0].id);
    this.router.navigate([`tabs/tab1/lista/${this.habitacionId}/reservacion/confirmacion`]);
    return;
  }else{
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for(let i = 0; i < this.reservaciones.length; i++){
      const fechasDeEntrada = new Date(this.reservaciones[i].fechaEntrada);
      const fechasDeSalida = new Date(this.reservaciones[i].fechaSalida);
      if((fechaEntrada >= fechasDeEntrada && fechaEntrada <= fechasDeSalida ) ||
        (fechaSalida >= fechasDeEntrada && fechaSalida <= fechasDeSalida) ||
        (fechasDeEntrada >= fechaEntrada && fechasDeSalida <= fechaSalida)){
          j++;
      }
     }
  }
   if(j === 0){
    fechaEntrada.setDate(fechaEntrada.getDate() - 1);
    fechaSalida.setDate(fechaSalida.getDate() - 1);
    this.hotelService.agregarReservacion(this.habitacionId,fechaEntrada ,fechaSalida, this.usuario[0].id);
    this.router.navigate([`tabs/tab1/lista/${this.habitacionId}/reservacion/confirmacion`]);
  }else{
    this.alertCtrl.create({
      header: 'Oops!',
      message: 'Fecha reservada actualmente.',
      buttons: ['Aceptar']
    }).then(
      alertElement =>{
        alertElement.present();
      }
    );
  }
  }

  deterNoche(){
    this.noches = 0;
    if(this.form.invalid) {return;}
    const ingreso = new Date(this.form.value.fechaEntrada);
    const salida = new Date(this.form.value.fechaSalida);
    if(ingreso <= salida){
    const diff = Math.abs(salida.getTime() - ingreso.getTime());
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24) - 1);
    this.noches = diffDays;
    console.log(diffDays);
    }else{
      this.noches = 0;
    }
  }
}
