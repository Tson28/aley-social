import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../services/profile.service';
import { PostService } from '../../../services/post.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  isLoading = true;
  error: string | null = null;
  isEditing = false;
  profileForm: FormGroup;
  avatarFile: File | null = null;
  coverImageFile: File | null = null;
  
  // Post data
  posts: any[] = [];
  postsLoading = false;
  postsError: string | null = null;
  currentPage = 1;
  totalPages = 0;
  totalPosts = 0;
  
  // Post menu properties
  activePostMenu: string | null = null;
  postToEdit: any = null;
  isEditingPost = false;
  editPostForm: FormGroup;
  postIdToDelete: string | null = null;
  isDeletingPost = false;
  
  // Thêm mới: Properties for edit post media
  editSelectedFiles: File[] = [];
  editPreviewImages: string[] = [];

  // Comment inputs
  commentInputs: { [postId: string]: string } = {};

  // Current user ID
  currentUserId: string = '';

  // New post modal
  showCreatePostModal = false;
  newPostContent = '';
  newPostPrivacy = 'public';
  newPostEmotion = 'none';
  newPostMedias: { type: string; url: string }[] = [];
  newPostFiles: File[] = [];

  // Tab navigation
  activeTab = 'posts';

  // Post filter
  postFilter = 'all';
  showPostFilter = false;

  // Stats
  followersCount = 0;
  followingCount = 0;
  friendsCount = 0;
  photoCount = 0;
  allPhotos: string[] = [];

  // More tabs
  showMoreTabs = false;
  
  // Private property for cache busting
  private _cacheBustingTimestamp: number = 0;
  
  constructor(
    private profileService: ProfileService,
    private postService: PostService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { 
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      bio: [''],
      location: [''],
      website: [''],
      phoneNumber: [''],
      interests: ['']
    });
    
    this.editPostForm = this.fb.group({
      content: ['', Validators.required],
      privacy: ['public'],
      hashtags: [''],
      emotion: ['none']
    });
  }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentUserId = user.id;
    }
    this.loadProfile();
  }

  getAvatarUrl(userId: string | undefined): string {
    if (!userId) return 'assets/images/default-avatar.png';
    
    // Use the same fixed timestamp to avoid ExpressionChangedAfterItHasBeenCheckedError
    if (!this._cacheBustingTimestamp) {
      this._cacheBustingTimestamp = new Date().getTime();
    }
    
    return `${environment.apiUrl}/profile/${userId}/avatar?t=${this._cacheBustingTimestamp}`;
  }

  getCoverImageUrl(userId: string | undefined): string {
    if (!userId) return 'assets/images/default-cover.jpg';
    
    // Use a fixed timestamp (updated on component init) to avoid ExpressionChangedAfterItHasBeenCheckedError
    if (!this._cacheBustingTimestamp) {
      this._cacheBustingTimestamp = new Date().getTime();
    }
    
    return `${environment.apiUrl}/profile/${userId}/cover?t=${this._cacheBustingTimestamp}`;
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
        
        // Update form with profile data
        this.profileForm.patchValue({
          firstName: this.profile.firstName,
          lastName: this.profile.lastName,
          bio: this.profile.bio,
          location: this.profile.location,
          website: this.profile.website,
          phoneNumber: this.profile.phoneNumber,
          interests: this.profile.interests ? this.profile.interests.join(', ') : ''
        });
        
        // Load user's posts after profile is loaded
        this.loadUserPosts();
      },
      error: (err) => {
        this.error = 'Could not load profile data';
        this.isLoading = false;
        console.error('Error loading profile:', err);
      }
    });
  }
  
  // Load posts for current user
  loadUserPosts(): void {
    if (!this.profile?._id) {
      console.error('Cannot load posts: profile ID is missing');
      return;
    }
    
    console.log('Loading posts for user ID:', this.profile._id);
    
    this.postsLoading = true;
    this.postsError = null;
    
    this.postService.getUserProfilePosts(this.profile._id, this.currentPage).subscribe({
      next: (response) => {
        console.log('Posts loaded successfully:', response);
        if (this.currentPage === 1) {
          this.posts = response.posts;
        } else {
          this.posts = [...this.posts, ...response.posts];
        }
        this.totalPosts = response.totalPosts;
        this.totalPages = response.totalPages;
        this.postsLoading = false;
        // Collect all photos
        this.collectPhotos();
        // Set stats
        this.followersCount = this.profile?.followers?.length || 0;
        this.friendsCount = this.profile?.friends?.length || 0;
      },
      error: (err) => {
        this.postsError = 'Không thể tải bài viết';
        this.postsLoading = false;
        console.error('Error loading user posts:', err);
      }
    });
  }

  collectPhotos(): void {
    this.allPhotos = [];
    for (const post of this.posts) {
      if (post.imageUrls && post.imageUrls.length > 0) {
        this.allPhotos = [...this.allPhotos, ...post.imageUrls];
      }
    }
    this.photoCount = this.allPhotos.length;
  }
  
  // Load more posts for infinite scrolling
  loadMorePosts(): void {
    if (this.currentPage >= this.totalPages || this.postsLoading) return;
    
    this.currentPage++;
    this.postsLoading = true;
    
    this.postService.getUserProfilePosts(this.profile._id, this.currentPage).subscribe({
      next: (response) => {
        this.posts = [...this.posts, ...response.posts];
        this.postsLoading = false;
        this.collectPhotos();
      },
      error: (err) => {
        this.postsError = 'Không thể tải thêm bài viết';
        this.postsLoading = false;
        this.currentPage--; // Revert page number if failed
        console.error('Error loading more posts:', err);
      }
    });
  }
  
  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    
    if (!this.isEditing) {
      // Reset form when canceling edit
      this.profileForm.patchValue({
        firstName: this.profile.firstName,
        lastName: this.profile.lastName,
        bio: this.profile.bio,
        location: this.profile.location,
        website: this.profile.website,
        phoneNumber: this.profile.phoneNumber,
        interests: this.profile.interests ? this.profile.interests.join(', ') : ''
      });
    }
  }
  
  saveProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }
    
    const formValues = this.profileForm.value;
    
    // Convert interests from comma-separated string to array
    const profileData = {
      ...formValues,
      interests: formValues.interests ? 
        formValues.interests.split(',').map((interest: string) => interest.trim()) : 
        []
    };
    
    this.profileService.updateProfile(profileData).subscribe({
      next: (data) => {
        this.profile = data;
        this.isEditing = false;
      },
      error: (err) => {
        this.error = 'Could not update profile';
        console.error('Error updating profile:', err);
      }
    });
  }
  
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.avatarFile = input.files[0];
      this.uploadAvatar();
    }
  }
  
  uploadAvatar(): void {
    if (!this.avatarFile) return;
    
    this.profileService.updateAvatar(this.avatarFile).subscribe({
      next: (data) => {
        this.profile.avatarUrl = data.avatarUrl;
        this.avatarFile = null;
      },
      error: (err) => {
        this.error = 'Could not upload avatar';
        console.error('Error uploading avatar:', err);
      }
    });
  }
  
  removeAvatar(): void {
    this.profileService.deleteAvatar().subscribe({
      next: (data) => {
        this.profile.avatarUrl = data.avatarUrl;
      },
      error: (err) => {
        this.error = 'Could not remove avatar';
        console.error('Error removing avatar:', err);
      }
    });
  }
  
  onCoverImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.coverImageFile = input.files[0];
      this.uploadCoverImage();
    }
  }
  
  uploadCoverImage(): void {
    if (!this.coverImageFile) return;
    
    this.profileService.updateCoverImage(this.coverImageFile).subscribe({
      next: (data) => {
        this.profile.coverImageUrl = data.coverImageUrl;
        this.coverImageFile = null;
      },
      error: (err) => {
        this.error = 'Could not upload cover image';
        console.error('Error uploading cover image:', err);
      }
    });
  }
  
  removeCoverImage(): void {
    this.profileService.deleteCoverImage().subscribe({
      next: (data) => {
        this.profile.coverImageUrl = data.coverImageUrl;
      },
      error: (err) => {
        this.error = 'Could not remove cover image';
        console.error('Error removing cover image:', err);
      }
    });
  }

  // Toggle post dropdown menu
  togglePostMenu(event: Event, postId: string): void {
    event.stopPropagation();
    if (this.activePostMenu === postId) {
      this.activePostMenu = null;
    } else {
      this.activePostMenu = postId;
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', () => {
      this.activePostMenu = null;
    }, { once: true });
  }
  
  // Open edit post modal
  editPost(post: any): void {
    this.activePostMenu = null; // Close dropdown
    this.postToEdit = post;
    this.isEditingPost = true;
    
    // Reset media arrays
    this.editSelectedFiles = [];
    this.editPreviewImages = [];
    
    // Initialize the form with post data
    this.editPostForm.patchValue({
      content: post.content,
      privacy: post.privacy,
      hashtags: post.hashtags ? post.hashtags.join(', ') : '',
      emotion: post.emotion || 'none'
    });
  }
  
  // Cancel post editing
  cancelEditPost(): void {
    this.isEditingPost = false;
    this.postToEdit = null;
    this.editPostForm.reset();
    this.editSelectedFiles = [];
    this.editPreviewImages = [];
  }
  
  // Handle file selection for editing
  onEditFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      this.editSelectedFiles = [...this.editSelectedFiles, ...files];
      
      // Create previews
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.editPreviewImages.push(e.target.result);
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
          // For videos, use a placeholder
          this.editPreviewImages.push('assets/images/video-placeholder.png');
        }
      }
    }
  }
  
  // Remove file from edit selection
  removeEditFile(index: number): void {
    this.editSelectedFiles.splice(index, 1);
    this.editPreviewImages.splice(index, 1);
  }
  
  // Save edited post
  updatePost(): void {
    if (this.editPostForm.invalid || !this.postToEdit) {
      return;
    }
    
    const formValues = this.editPostForm.value;
    
    // Parse hashtags from comma-separated string to array
    let hashtags = [];
    if (formValues.hashtags && formValues.hashtags.trim()) {
      hashtags = formValues.hashtags.split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
    }
    
    // Check if we have media files
    if (this.editSelectedFiles.length > 0) {
      // Need to use FormData for files
      const formData = new FormData();
      
      // Add text fields
      formData.append('content', formValues.content);
      formData.append('privacy', formValues.privacy);
      formData.append('emotion', formValues.emotion || 'none');
      
      // Add hashtags
      if (hashtags.length > 0) {
        formData.append('hashtags', hashtags.join(','));
      }
      
      // Add media files
      this.editSelectedFiles.forEach(file => {
        formData.append('media', file);
      });
      
      console.log('Updating post with media:', {
        postId: this.postToEdit._id,
        content: formValues.content,
        privacy: formValues.privacy,
        emotion: formValues.emotion,
        hashtags: hashtags,
        filesCount: this.editSelectedFiles.length
      });
      
      // Update post with media
      this.postService.updatePostWithMedia(this.postToEdit._id, formData).subscribe({
        next: (response: any) => {
          console.log('Post updated successfully with media:', response);
          // Update the post in the posts array
          const index = this.posts.findIndex(p => p._id === this.postToEdit._id);
          if (index !== -1) {
            this.posts[index] = response.post;
          }
          
          // Close the modal
          this.isEditingPost = false;
          this.postToEdit = null;
          this.editPostForm.reset();
          this.editSelectedFiles = [];
          this.editPreviewImages = [];
        },
        error: (err: any) => {
          console.error('Error updating post with media:', err);
          this.error = 'Không thể cập nhật bài viết với media';
        }
      });
    } else {
      // No media files, use regular update
      const updateData = {
        content: formValues.content,
        privacy: formValues.privacy,
        hashtags: hashtags,
        emotion: formValues.emotion || 'none'
      };
      
      console.log('Updating post without media:', updateData);
      
      this.postService.updatePost(this.postToEdit._id, updateData).subscribe({
        next: (response) => {
          console.log('Post updated successfully:', response);
          // Update the post in the posts array
          const index = this.posts.findIndex(p => p._id === this.postToEdit._id);
          if (index !== -1) {
            this.posts[index] = response.post;
          }
          
          // Close the modal
          this.isEditingPost = false;
          this.postToEdit = null;
          this.editPostForm.reset();
        },
        error: (err) => {
          console.error('Error updating post:', err);
          if (err.status === 403) {
            this.error = 'Bạn không có quyền cập nhật bài viết này';
          } else {
            this.error = 'Không thể cập nhật bài viết';
          }
        }
      });
    }
  }
  
  // Confirm post deletion
  confirmDeletePost(postId: string): void {
    this.activePostMenu = null; // Close dropdown
    this.postIdToDelete = postId;
    this.isDeletingPost = true;
  }
  
  // Cancel post deletion
  cancelDeletePost(): void {
    this.isDeletingPost = false;
    this.postIdToDelete = null;
  }
  
  // Delete post
  deletePost(): void {
    if (!this.postIdToDelete) {
      return;
    }
    
    console.log('Deleting post with ID:', {
      postId: this.postIdToDelete,
      postIdType: typeof this.postIdToDelete
    });
    
    this.postService.deletePost(this.postIdToDelete).subscribe({
      next: () => {
        // Remove the post from the posts array
        this.posts = this.posts.filter(p => p._id !== this.postIdToDelete);
        
        // Close the modal
        this.isDeletingPost = false;
        this.postIdToDelete = null;
      },
      error: (err) => {
        console.error('Error deleting post:', err);
        if (err.status === 403) {
          this.error = 'Bạn không có quyền xóa bài viết này';
        } else {
          this.error = 'Không thể xóa bài viết';
        }
      }
    });
  }

  // Check if the post belongs to current logged-in user
  isCurrentUserPost(post: any): boolean {
    // The logged-in user
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !post || !post.user || !this.profile) {
      return false;
    }
    
    // Convert IDs to strings for consistent comparison
    const currentUserId = String(currentUser.id);
    const profileId = String(this.profile._id);
    const postUserId = String(post.user._id);
    
    // First check if we're viewing the current user's profile
    const isOwnProfile = profileId === currentUserId;
    
    // Then check if the post belongs to the current user
    const isOwnPost = postUserId === currentUserId;
    
    // Log for debugging
    console.log('isCurrentUserPost check:', { 
      currentUserId,
      profileId,
      postUserId,
      isOwnProfile,
      isOwnPost
    });
    
    // Both conditions must be true - viewing own profile and post belongs to current user
    return isOwnProfile && isOwnPost;
  }

  // Toggle like on a post
  toggleLike(post: any): void {
    this.postService.toggleLike(post._id).subscribe({
      next: (response) => {
        post.likes = response.post.likes;
      },
      error: (err) => {
        console.error('Error toggling like:', err);
      }
    });
  }

  // Check if current user liked a post
  isLiked(post: any): boolean {
    return post.likes?.includes(this.currentUserId) || false;
  }

  // Toggle comments section visibility
  toggleComments(post: any): void {
    post.showComments = !post.showComments;
  }

  // Add a comment to a post
  addComment(post: any, commentText: string): void {
    if (!commentText.trim()) return;

    this.postService.addComment(post._id, commentText.trim()).subscribe({
      next: (response) => {
        post.comments = response.post.comments;
        this.commentInputs[post._id] = '';
      },
      error: (err) => {
        console.error('Error adding comment:', err);
      }
    });
  }

  // Format time as relative (e.g., "2 giờ trước")
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Vừa xong';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} tuần trước`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} tháng trước`;
    const years = Math.floor(days / 365);
    return `${years} năm trước`;
  }

  // Get emotion emoji
  getEmotionEmoji(emotion: string): string {
    const emotions: { [key: string]: string } = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      excited: '🤩',
      surprised: '😲',
      loved: '❤️',
      none: ''
    };
    return emotions[emotion] || '';
  }

  // Get privacy icon class
  getPrivacyIcon(privacy: string): string {
    const icons: { [key: string]: string } = {
      public: 'fa-globe',
      friends: 'fa-user-friends',
      private: 'fa-lock'
    };
    return icons[privacy] || 'fa-globe';
  }

  // Navigate to a user's profile
  navigateToProfile(userId: string): void {
    if (userId === this.currentUserId) {
      this.router.navigate(['/dashboard/profile']);
    } else {
      this.router.navigate(['/dashboard/user', userId]);
    }
  }

  // Tab navigation
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Post filter
  setPostFilter(filter: string): void {
    this.postFilter = filter;
    this.showPostFilter = false;
  }

  togglePostFilter(): void {
    this.showPostFilter = !this.showPostFilter;
  }

  get filteredPosts(): any[] {
    if (this.postFilter === 'all') return this.posts;
    return this.posts.filter(p => p.privacy === this.postFilter);
  }

  // Create post modal
  openCreatePostModal(): void {
    this.showCreatePostModal = true;
  }

  closeCreatePostModal(): void {
    this.showCreatePostModal = false;
    this.newPostContent = '';
    this.newPostPrivacy = 'public';
    this.newPostEmotion = 'none';
    this.newPostMedias = [];
    this.newPostFiles = [];
  }

  onNewPostMediaSelected(event: any): void {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      this.newPostFiles = [...this.newPostFiles, ...files];

      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.newPostMedias.push({
            type: file.type.startsWith('video/') ? 'video' : 'image',
            url: e.target.result
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeNewPostMedia(index: number): void {
    this.newPostMedias.splice(index, 1);
    this.newPostFiles.splice(index, 1);
  }

  submitNewPost(): void {
    if (!this.newPostContent.trim()) return;

    const formData = new FormData();
    formData.append('content', this.newPostContent);
    formData.append('privacy', this.newPostPrivacy);
    formData.append('emotion', this.newPostEmotion || 'none');

    this.newPostFiles.forEach(file => {
      formData.append('media', file);
    });

    this.postService.createPost(formData).subscribe({
      next: (response: any) => {
        this.posts = [response.post, ...this.posts];
        this.totalPosts++;
        this.closeCreatePostModal();
      },
      error: (err) => {
        console.error('Error creating post:', err);
        this.error = 'Không thể tạo bài viết';
      }
    });
  }

} 