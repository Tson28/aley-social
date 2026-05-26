import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Stream } from '../models/stream.model';

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all live streams
  getLiveStreams(): Observable<any> {
    return this.http.get(`${this.apiUrl}/streams`);
  }

  // Get my active stream
  getMyStream(): Observable<any> {
    return this.http.get(`${this.apiUrl}/streams/me`);
  }

  // Get a specific stream
  getStream(streamId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/streams/${streamId}`);
  }

  // Start a new stream
  createStream(title: string, description: string = ''): Observable<any> {
    return this.http.post(`${this.apiUrl}/streams`, { title, description });
  }

  // End a stream
  endStream(streamId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/streams/${streamId}/end`, {});
  }
}
