import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { SocketService } from '../services/socket.service';
import { SearchService } from '../services/search.service';
import { FriendsService } from '../services/friends.service';
import { ProfileService } from '../services/profile.service';
import { Notification } from '../models/notification.model';
import { environment } from '../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterOutlet
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  unreadNotificationCount: number = 0;
  unreadMessageCount: number = 0;
  notifications: Notification[] = [];
  showNotificationsPanel: boolean = false;
  isSocketConnected: boolean = false;
  isNotificationsLoading: boolean = false;
  friends: any[] = [];
  isLoadingFriends: boolean = false;
  
  // Search properties
  searchQuery: string = '';
  searchResults: any = { users: [], posts: [] };
  showSearchResults: boolean = false;
  isSearching: boolean = false;
  
  private subscriptions: Subscription[] = [];
  
  constructor(
    private authService: AuthService,
    public router: Router,
    private notificationService: NotificationService,
    private socketService: SocketService,
    private searchService: SearchService,
    private friendsService: FriendsService,
    private profileService: ProfileService
  ) { }
  
  ngOnInit(): void {
    // Subscribe to user info
    this.subscriptions.push(
      this.authService.currentUser.subscribe(user => {
        this.user = user;
      })
    );
    
    this.loadUserProfile();
    this.loadFriends();
    
    // Load notifications from service
    this.loadNotifications();
    
    // Subscribe to real-time notifications
    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadNotificationCount = count;
      })
    );
    
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
      })
    );
    
    // Subscribe to notification loading state
    this.subscriptions.push(
      this.notificationService.isLoading$.subscribe(isLoading => {
        this.isNotificationsLoading = isLoading;
      })
    );
    
    // Monitor socket connection
    this.subscriptions.push(
      this.socketService.connectionStatus$.subscribe(isConnected => {
        this.isSocketConnected = isConnected;
        console.log('Dashboard socket connection status:', isConnected);
      })
    );
  }
  
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  loadUserProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: any) => {
        this.user = profile;
        localStorage.setItem('user', JSON.stringify(profile));
      },
      error: (err) => {
        console.error('Error loading profile:', err);
      }
    });
  }

  loadFriends(): void {
    this.isLoadingFriends = true;
    this.friendsService.getFriends().subscribe({
      next: (response: any) => {
        this.friends = (response.data || response.friends || []).slice(0, 12);
        this.isLoadingFriends = false;
      },
      error: (err) => {
        console.error('Error loading friends:', err);
        this.isLoadingFriends = false;
      }
    });
  }

  navigateToUserProfile(userId: string): void {
    this.router.navigate(['/dashboard/user', userId]);
  }

  getFriendAvatarUrl(avatarUrl: string | undefined): string {
    if (avatarUrl) {
      return avatarUrl;
    }
    return 'assets/images/default-avatar.png';
  }
  
  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      error: (err) => {
        console.error('Error loading notifications:', err);
      }
    });
  }
  
  toggleNotificationsPanel() {
    this.showNotificationsPanel = !this.showNotificationsPanel;
    
    // Refresh notifications when opening the panel
    if (this.showNotificationsPanel) {
      this.refreshNotifications();
    }
  }

  refreshNotifications() {
    this.notificationService.refreshNotifications();
  }
  
  reconnectSocket() {
    this.socketService.reconnect();
  }
  
  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId).subscribe({
      error: (err) => {
        console.error('Error marking notification as read:', err);
      }
    });
  }
  
  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      error: (err) => {
        console.error('Error marking all notifications as read:', err);
      }
    });
  }
  
  getNotificationText(notification: Notification): string {
    const senderName = `${notification.sender.firstName} ${notification.sender.lastName}`;
    
    switch (notification.type) {
      case 'like':
        return `${senderName} đã thích bài viết của bạn`;
      case 'comment':
        return `${senderName} đã bình luận về bài viết của bạn`;
      case 'friend_request':
        return `${senderName} đã gửi cho bạn lời mời kết bạn`;
      default:
        return 'Bạn có thông báo mới';
    }
  }
  
  getNotificationTime(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Vừa xong';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    
    if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays < 30) {
      return `${diffInDays} ngày trước`;
    }
    
    return created.toLocaleDateString('vi-VN');
  }
  
  navigateFromNotification(notification: Notification) {
    this.markAsRead(notification._id);
    
    if (notification.type === 'friend_request') {
      this.router.navigate(['/dashboard/friends']);
    } else if (notification.type === 'like' || notification.type === 'comment') {
      // Navigate to the post if available
      if (notification.postId) {
        this.router.navigate(['/dashboard/post', notification.postId._id]);
      } else {
        this.router.navigate(['/dashboard/home']);
      }
    }
    
    this.showNotificationsPanel = false;
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }
  
  navigateToBlockedUsers(): void {
    this.router.navigate(['/dashboard/settings'], { queryParams: { tab: 'blocked' } });
  }

  getCurrentUserAvatar(): string {
    if (this.user && this.user.avatarUrl) {
      return this.user.avatarUrl;
    }
    if (this.user && this.user._id) {
      return `${environment.apiUrl}/profile/${this.user._id}/avatar`;
    }
    return 'assets/images/default-avatar.png';
  }

  // Search methods
  onSearch(): void {
    if (this.searchQuery.trim().length > 0) {
      this.isSearching = true;
      this.showSearchResults = true;
      this.searchService.search(this.searchQuery).subscribe({
        next: (results) => {
          this.searchResults = results;
          this.isSearching = false;
        },
        error: (err) => {
          console.error('Search error:', err);
          this.isSearching = false;
        }
      });
    } else {
      this.clearSearch();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = { users: [], posts: [] };
    this.showSearchResults = false;
    this.isSearching = false;
  }

  navigateToUser(userId: string): void {
    this.clearSearch();
    this.router.navigate(['/dashboard/profile'], { queryParams: { id: userId } });
  }

  navigateToPost(postId: string): void {
    this.clearSearch();
    this.router.navigate(['/dashboard/home'], { queryParams: { post: postId } });
  }

  closeSearchResults(): void {
    this.showSearchResults = false;
  }
} 