import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Story } from '../models/story.model';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private apiUrl = environment.apiUrl;

  // Mock data for demo (fallback when API fails)
  private mockStories: Story[] = [
    {
      _id: '1',
      user: { _id: 'user1', firstName: 'Minh', lastName: 'Nguyễn', avatarUrl: this.generateShapeAvatar('user1', 'circle', '#FF6B6B') },
      imageUrl: 'https://picsum.photos/seed/story1/400/300',
      statusText: 'Cuối tuần tuyệt vời bên gia đình!',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      user: { _id: 'user2', firstName: 'Lan', lastName: 'Trần', avatarUrl: this.generateShapeAvatar('user2', 'square', '#4ECDC4') },
      imageUrl: 'https://picsum.photos/seed/story2/400/300',
      statusText: 'Cà phê sáng nay thật hoàn hảo',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '3',
      user: { _id: 'user3', firstName: 'Hùng', lastName: 'Lê', avatarUrl: this.generateShapeAvatar('user3', 'triangle', '#45B7D1') },
      imageUrl: 'https://picsum.photos/seed/story3/400/300',
      statusText: 'Làm việc chăm chỉ để đạt được mục tiêu!',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '4',
      user: { _id: 'user4', firstName: 'Hoa', lastName: 'Phạm', avatarUrl: this.generateShapeAvatar('user4', 'circle', '#96CEB4') },
      imageUrl: 'https://picsum.photos/seed/story4/400/300',
      statusText: 'Mùa hè này đi đâu nhỉ?',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: '5',
      user: { _id: 'user5', firstName: 'Nam', lastName: 'Hoàng', avatarUrl: this.generateShapeAvatar('user5', 'square', '#FFEAA7') },
      imageUrl: 'https://picsum.photos/seed/story5/400/300',
      statusText: 'Gym time! Không có gì là không thể',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
  ];

  constructor(private http: HttpClient) {}

  // Generate a simple geometric shape avatar as SVG data URL
  generateShapeAvatar(userId: string, shape: 'circle' | 'square' | 'triangle', color: string): string {
    const svgSize = 100;
    let svgContent = '';

    if (shape === 'circle') {
      svgContent = `<circle cx="50" cy="50" r="45" fill="${color}"/>`;
    } else if (shape === 'square') {
      svgContent = `<rect x="5" y="5" width="90" height="90" rx="8" fill="${color}"/>`;
    } else if (shape === 'triangle') {
      svgContent = `<polygon points="50,5 95,95 5,95" fill="${color}"/>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}">${svgContent}</svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  // Get all stories - try real API first, fallback to mock
  getStories(): Observable<Story[]> {
    return this.http.get<any>(`${this.apiUrl}/posts`).pipe(
      map(response => {
        const posts = response.posts || [];
        // Use recent posts with images as stories
        const storyPosts = posts
          .filter((post: any) => post.imageUrls && post.imageUrls.length > 0)
          .slice(0, 10)
          .map((post: any) => ({
            _id: post._id,
            user: {
              _id: post.user?._id || post.user,
              firstName: post.user?.firstName || 'User',
              lastName: post.user?.lastName || '',
              avatarUrl: post.user?.avatarUrl || ''
            },
            imageUrl: post.imageUrls[0],
            statusText: post.content || '',
            createdAt: post.createdAt
          }));

        if (storyPosts.length > 0) {
          return storyPosts;
        }
        return this.mockStories;
      }),
      catchError(() => {
        return of(this.mockStories);
      })
    );
  }

  // Create a new story (post with image)
  createStory(file: File, statusText: string = ''): Observable<any> {
    const formData = new FormData();
    formData.append('content', statusText);
    formData.append('media', file);

    return this.http.post(`${this.apiUrl}/posts`, formData).pipe(
      map(response => {
        const post = (response as any).post;
        return {
          success: true,
          story: {
            _id: post._id,
            user: post.user,
            imageUrl: post.imageUrls?.[0] || '',
            statusText: post.content || '',
            createdAt: post.createdAt
          }
        };
      }),
      catchError(err => {
        // Fallback mock response
        return of({
          success: true,
          story: {
            _id: Date.now().toString(),
            user: { _id: 'currentUser', firstName: 'Bạn', lastName: '', avatarUrl: '' },
            imageUrl: URL.createObjectURL(file),
            statusText: statusText,
            createdAt: new Date().toISOString()
          }
        });
      })
    );
  }
}
