import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthResponseData, AuthService } from './auth.service';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive';
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {

  isLogin = false;
  isLoading = false;
  error: string = null;
  EmailValue:any;
  @ViewChild(PlaceholderDirective) alertHost: PlaceholderDirective;

  private closeSub: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ComponentFactoryResolver: ComponentFactoryResolver
    ) { }

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
        this.showErrorAlert(ErrorMessage);
        this.isLoading = false;
      }
    );
    form.reset();
  }

  OnHandleError(){
    this.error = null;
  }

  ngOnDestroy(): void {
    if(this.closeSub){
      this.closeSub.unsubscribe();
    }
  }

  private showErrorAlert(message: string) {
    const alertComFactory = this.ComponentFactoryResolver.resolveComponentFactory(AlertComponent);
    const hostviewContainerRef = this.alertHost.ViewContainerRef;
    hostviewContainerRef.clear();
    const ComponentRef = hostviewContainerRef.createComponent(alertComFactory);
    ComponentRef.instance.message = message;
    this.closeSub = ComponentRef.instance.close.subscribe(()=> {
      this.closeSub.unsubscribe();
      hostviewContainerRef.clear();
    })
  }
}
