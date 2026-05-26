import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn
} from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const token = localStorage.getItem('token');

  // Skip auth for AI chat endpoint
  if (req.url.includes('/api/ai')) {
    const cloned = req.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    });
    return next(cloned);
  }

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
}; 