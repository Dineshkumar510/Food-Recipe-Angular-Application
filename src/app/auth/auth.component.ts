import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthResponseData, AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  isLogin = false;
  isLoading = false;
  error: string = null;
  EmailValue:any;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  switchMode(){
    this.isLogin = !this.isLogin;
  }

  OnSubmit(form : NgForm){
    if(!form.valid){
      return
    }

    let authObs : Observable<AuthResponseData>;

    const email = form.value.email;
    const password = form.value.password
    const ConfirmPassword = form.value.ConfirmPassword

    this.isLoading = true;
    if(!this.isLogin){
      authObs = this.authService.Login(email,password)
    } else {
     authObs = this.authService.signUp(email, password, ConfirmPassword)
    }

    //Common subscribe Method for both signUp & Login beacause of that we have used Observable.
    authObs.subscribe(
      responseData => {
        console.log(responseData);
        this.isLoading = false;
        this.router.navigate(['/recipes'])
      }, ErrorMessage => {
        console.log(ErrorMessage);
        this.error = ErrorMessage;
        this.isLoading = false;
      }
    );

    form.reset();
  }

}
