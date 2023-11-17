import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from './user.model';
import { Router } from '@angular/router';


//you can get this data for official firebase website of Firebase Auth Rest-API
 export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered? : boolean;
}

@Injectable({providedIn: 'root'})
export class AuthService {
  user = new BehaviorSubject<User>(null);
  tokenexpirationTimer : any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  authSignUpKey = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAPlcSLtT1CEruC2_tE6gA9R-PulbLCcWA';

  authLoginKey = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAPlcSLtT1CEruC2_tE6gA9R-PulbLCcWA';


  signUp(email: string, password: string, confirmpassword){
      return this.http.post<AuthResponseData>(this.authSignUpKey,
        {
          email: email,
          password: password,
          returnSecureToken: true
        }
      ).pipe(catchError(this.handleError),
      tap(resData => {
        this.handleAuthenication(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
      })
    );
  }

  Login(email: string, password: string) {
      return this.http.post<AuthResponseData>(this.authLoginKey,
      {
        email: email,
        password: password,
        returnSecureToken: true
      }
    ).pipe(catchError(this.handleError),
    tap(resData => {
      this.handleAuthenication(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
      console.log(resData.email, resData.localId, resData.idToken, +resData.expiresIn)
    })
  );
}


  autoLogin(){
    const userData : {
      email: string,
      id: string,
      _token : string,
      _tokenExpirationDate: string} = JSON.parse(localStorage.getItem('UserData'));

      if(!userData){
        return;
      }

      const LoadUser = new User( userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

      if(LoadUser.token){
        this.user.next(LoadUser);
        const expirationDuration =  new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
        this.autoLogOut(expirationDuration);
      }
  }


  logout(){
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('UserData');
    if(this.tokenexpirationTimer){
      clearTimeout(this.tokenexpirationTimer);
    }
    this.tokenexpirationTimer = null;
  }

  autoLogOut(expirationDuration : number){
    this.tokenexpirationTimer = setTimeout(()=>{
      this.logout();
    }, expirationDuration);
  }


  //For not repating again for SignUp & Login we have written same error logic for both.
  private handleAuthenication(email: string, userId: string, token: string, expiresIn: number) {
    const exiprationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(email, userId, token, exiprationDate);
        this.user.next(user);
        this.autoLogOut(expiresIn * 1000);
        localStorage.setItem('UserData', JSON.stringify(user));
        console.log(email, userId, token, exiprationDate)
  }


  //For not repating again for SignUp & Login we have written same error logic for both.
  private handleError(errorRes: HttpErrorResponse) {
    let ErrorMessage = 'An Error Occured';
        if(!errorRes.error || !errorRes.error.error) {
          return throwError(ErrorMessage)
        }
        switch(errorRes.error.error.message) {
          case 'EMAIL_EXISTS':
            ErrorMessage = 'This Email is Already Exists';
            break;
          case 'INVALID_LOGIN_CREDENTIALS':
            ErrorMessage = 'Email Or PassWord does not match in the DataBase';

            break;
        }
        return throwError(ErrorMessage)
      }
  }

