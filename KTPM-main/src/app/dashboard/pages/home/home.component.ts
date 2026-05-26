import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../../../services/post.service';
import { Post, PostCreateDto } from '../../../models/post.model';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ProfileNavigatorService } from '../../../services/profile-navigator.service';
import { Router } from '@angular/router';
import { ReportService } from '../../../services/report.service';
import { StoryService } from '../../../services/story.service';
import { Story } from '../../../models/story.model';
import { StreamService } from '../../../services/stream.service';
import { Stream, StreamChatMessage } from '../../../models/stream.model';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule]
})
export class HomeComponent implements OnInit {
  posts: Post[] = [];
  stories: Story[] = [];
  postForm: FormGroup;
  editPostForm: FormGroup;
  reportForm: FormGroup;
  isLoading = false;
  page = 1;
  limit = 10;
  totalPosts = 0;
  selectedFiles: File[] = [];
  previewImages: string[] = [];
  editingPost: Post | null = null;
  isEditingPostModal = false;
  editSelectedFiles: File[] = [];
  editPreviewImages: string[] = [];
  filesToRemove: string[] = [];
  currentUser: any = null;
  showReportModal = false;
  showCreatePostModal = false;
  showStoryModal = false;
  storyFile: File | null = null;
  storyPreview: string = '';
  storyStatusText: string = '';
  reportingPost: Post | null = null;
  isSubmittingReport = false;
  randomMode = false;
  isCreatingStory = false;
  // Story viewer
  viewingStory: Story | null = null;
  showStoryViewer = false;
  // Stream properties
  liveStreams: Stream[] = [];
  isLoadingStreams = false;
  showCreateLiveModal = false;
  liveTitle = '';
  liveDescription = '';
  myActiveStream: Stream | null = null;
  isStartingStream = false;
  // Stream viewer
  viewingStream: Stream | null = null;
  showStreamViewer = false;
  streamViewerCount = 0;
  streamChatMessages: StreamChatMessage[] = [];
  streamChatInput = '';
  isJoiningStream = false;
  emotions = [
    { value: 'none', label: 'Không có' },
    { value: 'happy', label: 'Vui vẻ 😊' },
    { value: 'sad', label: 'Buồn 😢' },
    { value: 'angry', label: 'Tức giận 😠' },
    { value: 'excited', label: 'Phấn khích 🤩' },
    { value: 'surprised', label: 'Ngạc nhiên 😲' },
    { value: 'loved', label: 'Yêu thích ❤️' }
  ];
  
  privacyOptions = [
    { value: 'public', label: 'Công khai', icon: 'fa-globe' },
    { value: 'friends', label: 'Bạn bè', icon: 'fa-user-friends' },
    { value: 'private', label: 'Chỉ mình tôi', icon: 'fa-lock' }
  ];

  // Cache timestamp cho URLs
  private timestampCache = new Date().getTime();

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private profileNavigator: ProfileNavigatorService,
    private router: Router,
    private reportService: ReportService,
    private storyService: StoryService,
    private streamService: StreamService,
    private socketService: SocketService
  ) {
    this.postForm = this.fb.group({
      content: ['', [Validators.required]],
      hashtags: [''],
      emotion: ['none'],
      privacy: ['public']
    });
    
    // Initialize the edit form
    this.editPostForm = this.fb.group({
      content: ['', [Validators.required]],
      hashtags: [''],
      emotion: ['none'],
      privacy: ['public']
    });
    
    // Initialize the report form
    this.reportForm = this.fb.group({
      violationType: ['', [Validators.required]],
      additionalDetails: ['']
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadPosts();
    this.loadStories();
    this.loadLiveStreams();
    this.setupStreamSocketListeners();
    this.checkMyActiveStream();
  }

  loadStories(): void {
    this.storyService.getStories().subscribe({
      next: (stories) => {
        this.stories = stories;
      },
      error: (err) => {
        console.error('Error loading stories:', err);
      }
    });
  }

  openStoryModal(): void {
    this.showStoryModal = true;
    this.storyFile = null;
    this.storyPreview = '';
    this.storyStatusText = '';
  }

  closeStoryModal(): void {
    this.showStoryModal = false;
    this.storyFile = null;
    this.storyPreview = '';
    this.storyStatusText = '';
  }

  onStoryFileChange(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.storyFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.storyPreview = e.target.result;
      };
      if (this.storyFile) {
        reader.readAsDataURL(this.storyFile);
      }
    }
  }

  createStory(): void {
    if (!this.storyFile) {
      this.toastr.warning('Vui lòng chọn ảnh để tạo tin');
      return;
    }

    this.isCreatingStory = true;
    this.storyService.createStory(this.storyFile, this.storyStatusText).subscribe({
      next: (response) => {
        if (response.success) {
          this.stories.unshift(response.story);
          this.toastr.success('Tin của bạn đã được đăng!');
          this.closeStoryModal();
        }
        this.isCreatingStory = false;
      },
      error: (err) => {
        console.error('Error creating story:', err);
        this.toastr.error('Không thể tạo tin. Vui lòng thử lại.');
        this.isCreatingStory = false;
      }
    });
  }

  openStoryViewer(story: Story): void {
    this.viewingStory = story;
    this.showStoryViewer = true;
  }

  closeStoryViewer(): void {
    this.showStoryViewer = false;
    this.viewingStory = null;
  }

  // ============ STREAM METHODS ============

  loadLiveStreams(): void {
    this.isLoadingStreams = true;
    this.streamService.getLiveStreams().subscribe({
      next: (response: any) => {
        this.liveStreams = response.data || [];
        this.isLoadingStreams = false;
      },
      error: (err) => {
        console.error('Error loading streams:', err);
        this.isLoadingStreams = false;
      }
    });
  }

  checkMyActiveStream(): void {
    this.streamService.getMyStream().subscribe({
      next: (response: any) => {
        this.myActiveStream = response.stream;
      },
      error: () => {}
    });
  }

  openCreateLiveModal(): void {
    this.showCreateLiveModal = true;
    this.liveTitle = '';
    this.liveDescription = '';
  }

  closeCreateLiveModal(): void {
    this.showCreateLiveModal = false;
    this.liveTitle = '';
    this.liveDescription = '';
  }

  startLiveStream(): void {
    if (!this.liveTitle.trim()) {
      this.toastr.warning('Vui lòng nhập tiêu đề cho buổi live');
      return;
    }

    this.isStartingStream = true;
    this.streamService.createStream(this.liveTitle, this.liveDescription).subscribe({
      next: (response) => {
        if (response.success) {
          this.myActiveStream = response.stream;
          this.liveStreams.unshift(response.stream);
          this.toastr.success('Buổi live của bạn đã bắt đầu!');
          this.closeCreateLiveModal();
          this.setupBroadcasterSocket(response.stream._id);
        }
        this.isStartingStream = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Không thể bắt đầu buổi live');
        this.isStartingStream = false;
      }
    });
  }

  endLiveStream(): void {
    if (!this.myActiveStream) return;

    if (!confirm('Bạn có chắc muốn kết thúc buổi live?')) return;

    this.streamService.endStream(this.myActiveStream._id).subscribe({
      next: (response) => {
        if (response.success) {
          this.liveStreams = this.liveStreams.filter(s => s._id !== this.myActiveStream?._id);
          this.toastr.success('Buổi live đã kết thúc');
          this.myActiveStream = null;
          this.closeStreamViewer();
        }
      },
      error: (err) => {
        this.toastr.error('Không thể kết thúc buổi live');
      }
    });
  }

  openStreamViewer(stream: Stream): void {
    this.viewingStream = stream;
    this.showStreamViewer = true;
    this.streamChatMessages = [];
    this.streamViewerCount = stream.viewerCount || 0;

    // Join stream room via socket
    if (this.currentUser) {
      this.socketService.emit('stream:join', {
        streamId: stream._id,
        userId: this.currentUser._id
      });
    }
  }

  closeStreamViewer(): void {
    if (this.viewingStream && this.currentUser) {
      this.socketService.emit('stream:leave', {
        streamId: this.viewingStream._id,
        userId: this.currentUser._id
      });
    }
    this.showStreamViewer = false;
    this.viewingStream = null;
    this.streamChatMessages = [];
  }

  sendStreamChat(): void {
    if (!this.streamChatInput.trim() || !this.viewingStream || !this.currentUser) return;

    const userName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    const isBroadcaster = this.myActiveStream?._id === this.viewingStream?._id;

    if (isBroadcaster) {
      this.socketService.emit('stream:broadcasterMessage', {
        streamId: this.viewingStream._id,
        userId: this.currentUser._id,
        userName,
        message: this.streamChatInput.trim()
      });
    } else {
      this.socketService.emit('stream:chatMessage', {
        streamId: this.viewingStream._id,
        userId: this.currentUser._id,
        userName,
        message: this.streamChatInput.trim()
      });
    }

    this.streamChatInput = '';
  }

  setupStreamSocketListeners(): void {
    // Listen for new streams
    this.socketService.on('stream:started', (data: any) => {
      if (data.success && data.stream) {
        const exists = this.liveStreams.find(s => s._id === data.stream._id);
        if (!exists) {
          this.liveStreams.unshift(data.stream);
        }
      }
    });

    // Listen for ended streams
    this.socketService.on('stream:ended', (data: any) => {
      if (data.success) {
        this.liveStreams = this.liveStreams.filter(s => s._id !== data.streamId);
        if (this.viewingStream?._id === data.streamId) {
          this.closeStreamViewer();
          this.toastr.info('Buổi live đã kết thúc');
        }
        if (this.myActiveStream?._id === data.streamId) {
          this.myActiveStream = null;
        }
      }
    });

    // Listen for viewer count updates
    this.socketService.on('stream:viewerJoined', (data: any) => {
      if (this.viewingStream?._id === data.streamId) {
        this.streamViewerCount = data.viewerCount;
      }
    });

    this.socketService.on('stream:viewerLeft', (data: any) => {
      if (this.viewingStream?._id === data.streamId) {
        this.streamViewerCount = data.viewerCount;
      }
    });

    // Listen for chat messages
    this.socketService.on('stream:chatMessage', (data: StreamChatMessage) => {
      if (this.viewingStream?._id === data.streamId) {
        this.streamChatMessages.push(data);
        // Keep only last 50 messages
        if (this.streamChatMessages.length > 50) {
          this.streamChatMessages = this.streamChatMessages.slice(-50);
        }
      }
    });
  }

  setupBroadcasterSocket(streamId: string): void {
    // Broadcaster listens for chat messages too
    this.socketService.on('stream:chatMessage', (data: StreamChatMessage) => {
      if (data.streamId === streamId) {
        this.streamChatMessages.push(data);
        if (this.streamChatMessages.length > 50) {
          this.streamChatMessages = this.streamChatMessages.slice(-50);
        }
      }
    });
  }

  isBroadcaster(stream: Stream): boolean {
    return this.myActiveStream?._id === stream._id;
  }

  getStreamTimeAgo(dateString: string): string {
    return this.formatTimeAgo(dateString);
  }

  getStreamViewerCount(stream: Stream): string {
    const count = stream.viewerCount || 0;
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  openCreatePostModal(): void {
    this.showCreatePostModal = true;
  }

  closeCreatePostModal(): void {
    this.showCreatePostModal = false;
    this.resetForm();
  }

  loadCurrentUser(): void {
    this.authService.getProfile().subscribe({
      next: (response: any) => {
        if (response && response.user) {
          this.currentUser = response.user;
        } else if (response) {
          this.currentUser = response;
        }
      },
      error: (error: any) => {
        console.error('Error loading current user:', error);
      }
    });
  }

  loadPosts(): void {
    this.isLoading = true;
    this.postService.getPosts(this.page, this.limit, false).subscribe({
      next: (response) => {
        this.posts = response.posts;
        this.totalPosts = response.totalPosts;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading posts:', error);
        this.toastr.error('Không thể tải bài viết. Vui lòng thử lại sau.');
        this.isLoading = false;
      }
    });
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      this.selectedFiles = [...this.selectedFiles, ...files];
      
      // Create previews for images
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.previewImages.push(e.target.result);
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
          // For videos, use a data URI placeholder instead of file
          this.previewImages.push('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiM2NjY2NjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI2MCIgcj0iMzAiIGZpbGw9IiMzMzMzMzMiLz48cG9seWdvbiBwb2ludHM9IjkwLDQ1IDkwLDc1IDEyMCw2MCIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VmlkZW8gUHJldmlldzwvdGV4dD48L3N2Zz4=');
        }
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewImages.splice(index, 1);
  }

  submitPost(): void {
    if (this.postForm.invalid) {
      return;
    }
    
    const formData = new FormData();
    const postData: PostCreateDto = this.postForm.value;
    
    // Add text fields
    formData.append('content', postData.content);
    if (postData.hashtags) formData.append('hashtags', postData.hashtags);
    formData.append('emotion', postData.emotion || 'none');
    formData.append('privacy', postData.privacy || 'public');
    
    // Add media files
    this.selectedFiles.forEach(file => {
      formData.append('media', file);
    });
    
    this.isLoading = true;
    
    if (this.editingPost) {
      // Update existing post
      this.postService.updatePost(this.editingPost._id, postData).subscribe({
        next: (response) => {
          this.toastr.success('Bài viết đã được cập nhật thành công!');
          const index = this.posts.findIndex(p => p._id === this.editingPost?._id);
          if (index > -1) {
            this.posts[index] = response.post;
          }
          this.resetForm();
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error updating post:', error);
          this.toastr.error('Lỗi khi cập nhật bài viết. Vui lòng thử lại sau.');
          this.isLoading = false;
        }
      });
    } else {
      // Create new post
      this.postService.createPost(formData).subscribe({
        next: (response) => {
          this.toastr.success('Bài viết đã được tạo thành công!');
          this.posts.unshift(response.post);
          this.resetForm();
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error creating post:', error);
          this.toastr.error('Lỗi khi tạo bài viết. Vui lòng thử lại sau.');
          this.isLoading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.postForm.reset({
      content: '',
      hashtags: '',
      emotion: 'none',
      privacy: 'public'
    });
    this.selectedFiles = [];
    this.previewImages = [];
    this.editingPost = null;
    this.showCreatePostModal = false;
  }

  editPost(post: Post): void {
    this.editingPost = post;
    this.isEditingPostModal = true;
    
    // Initialize edit form
    this.editPostForm = this.fb.group({
      content: [post.content, [Validators.required]],
      hashtags: [post.hashtags ? post.hashtags.join(', ') : ''],
      emotion: [post.emotion || 'none'],
      privacy: [post.privacy || 'public']
    });
    
    // Reset edit media
    this.editSelectedFiles = [];
    this.editPreviewImages = [];
    this.filesToRemove = [];
  }

  cancelEditPost(): void {
    this.isEditingPostModal = false;
    this.editingPost = null;
    this.editSelectedFiles = [];
    this.editPreviewImages = [];
    this.filesToRemove = [];
  }

  onEditFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      this.editSelectedFiles = [...this.editSelectedFiles, ...files];
      
      // Create previews for images
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.editPreviewImages.push(e.target.result);
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
          // For videos, use a placeholder
          this.editPreviewImages.push('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiM2NjY2NjYiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI2MCIgcj0iMzAiIGZpbGw9IiMzMzMzMzMiLz48cG9seWdvbiBwb2ludHM9IjkwLDQ1IDkwLDc1IDEyMCw2MCIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VmlkZW8gUHJldmlldzwvdGV4dD48L3N2Zz4=');
        }
      }
    }
  }

  removeEditFile(index: number): void {
    this.editSelectedFiles.splice(index, 1);
    this.editPreviewImages.splice(index, 1);
  }

  removeExistingImage(index: number): void {
    if (this.editingPost && this.editingPost.imageUrls) {
      this.filesToRemove.push(this.editingPost.imageUrls[index]);
    }
  }

  removeExistingVideo(index: number): void {
    if (this.editingPost && this.editingPost.videoUrls) {
      this.filesToRemove.push(this.editingPost.videoUrls[index]);
    }
  }

  updatePost(): void {
    if (!this.editingPost || this.editPostForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    // First handle text update
    const postData = {
      content: this.editPostForm.value.content,
      hashtags: this.editPostForm.value.hashtags || '',
      emotion: this.editPostForm.value.emotion || 'none',
      privacy: this.editPostForm.value.privacy || 'public'
    };
    
    const postId = this.editingPost._id;
    
    // Update the post text content first
    this.postService.updatePost(postId, postData).subscribe({
      next: (response) => {
        // Only upload new media files if there are any
        if (this.editSelectedFiles.length > 0 && this.editingPost) {
          this.uploadMediaForPost(postId, response.post);
        } else {
          this.toastr.success('Bài viết đã được cập nhật thành công!');
          const index = this.posts.findIndex(p => p._id === postId);
          if (index > -1) {
            this.posts[index] = response.post;
          }
          this.cancelEditPost();
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        console.error('Error updating post:', error);
        this.toastr.error('Lỗi khi cập nhật bài viết. Vui lòng thử lại sau.');
        this.isLoading = false;
      }
    });
  }

  // Helper method to upload media for a post
  uploadMediaForPost(postId: string, updatedPost: any): void {
    if (!postId || !updatedPost) {
      this.isLoading = false;
      this.cancelEditPost();
      return;
    }
    
    const formData = new FormData();
    
    // Add required text fields to avoid 400 Bad Request error
    formData.append('content', updatedPost.content || '');
    
    // Add files to remove if any
    if (this.filesToRemove.length > 0) {
      formData.append('filesToRemove', JSON.stringify(this.filesToRemove));
    }
    
    // Add media files
    this.editSelectedFiles.forEach(file => {
      formData.append('media', file);
    });
    
    // Use updatePostWithMedia endpoint instead of createPost
    this.postService.updatePostWithMedia(postId, formData).subscribe({
      next: (response) => {
        this.toastr.success('Bài viết đã được cập nhật thành công!');
        
        // Update the post in the UI
        const index = this.posts.findIndex(p => p._id === postId);
        if (index > -1) {
          this.posts[index] = response.post;
        }
        
        this.cancelEditPost();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error uploading media:', error);
        this.toastr.error('Lỗi khi tải lên tệp. Bài viết đã được cập nhật nhưng không có tệp mới.');
        this.isLoading = false;
        this.cancelEditPost();
      }
    });
  }

  deletePost(postId: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.toastr.success('Bài viết đã được xóa thành công!');
          this.posts = this.posts.filter(post => post._id !== postId);
        },
        error: (error: any) => {
          console.error('Error deleting post:', error);
          this.toastr.error('Lỗi khi xóa bài viết. Vui lòng thử lại sau.');
        }
      });
    }
  }

  toggleLike(post: Post): void {
    if (!this.currentUser) {
      this.toastr.info('Vui lòng đăng nhập để thích bài viết.');
      return;
    }
    
    const userId = this.currentUser._id;
    
    if (!post.likes) {
      post.likes = [];
    }
    
    const isLiked = post.likes.includes(userId);
    
    this.postService.toggleLike(post._id).subscribe({
      next: (response) => {
        if (isLiked) {
          post.likes = post.likes.filter(id => id !== userId);
        } else {
          post.likes.push(userId);
        }
      },
      error: (error) => {
        console.error('Error toggling like:', error);
        this.toastr.error('Không thể thích bài viết. Vui lòng thử lại sau.');
      }
    });
  }

  addComment(post: Post, commentText: string): void {
    if (!commentText.trim()) return;
    
    this.postService.addComment(post._id, commentText).subscribe({
      next: (response) => {
        const index = this.posts.findIndex(p => p._id === post._id);
        if (index > -1) {
          this.posts[index].comments.push(response.comment);
        }
      },
      error: (error: any) => {
        console.error('Error adding comment:', error);
        this.toastr.error('Không thể thêm bình luận. Vui lòng thử lại sau.');
      }
    });
  }

  loadMorePosts(): void {
    if (this.isLoading) return;
    
    // In non-random mode, load next page and append to existing posts
    this.isLoading = true;
    this.page += 1;
    
    this.postService.getPosts(this.page, this.limit, false).subscribe({
      next: (response) => {
        // Append new posts to existing ones
        this.posts = [...this.posts, ...response.posts];
        this.totalPosts = response.totalPosts;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading more posts:', error);
        this.toastr.error('Không thể tải thêm bài viết. Vui lòng thử lại sau.');
        this.isLoading = false;
        // Revert page increment on error
        this.page -= 1;
      }
    });
  }

  isPostOwner(post: Post): boolean {
    if (!post || !post.user || !this.currentUser) {
      return false;
    }
    return String(post.user._id) === String(this.currentUser._id);
  }

  getPrivacyIcon(privacy: string): string {
    const option = this.privacyOptions.find(opt => opt.value === privacy);
    return option ? option.icon : 'fa-globe';
  }

  getEmotionEmoji(emotion: string): string {
    const option = this.emotions.find(opt => opt.value === emotion);
    return option ? option.label.split(' ')[1] || '' : '';
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) {
      return 'Vừa xong';
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} phút trước`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} giờ trước`;
    }
    
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days} ngày trước`;
    }
    
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} tháng trước`;
    }
    
    const years = Math.floor(months / 12);
    return `${years} năm trước`;
  }

  getAvatarUrl(userId: string | undefined): string {
    if (!userId) {
      return 'assets/images/default-avatar.png';
    }
    // Sửa đường dẫn để phù hợp với các component khác
    return `${environment.apiUrl}/profile/${userId}/avatar?t=${this.timestampCache}`;
  }

  navigateToProfile(userId: string | undefined): void {
    if (!userId) {
      return;
    }
    this.profileNavigator.navigateToProfile(userId);
  }
  
  // Kiểm tra xem có phải người dùng hiện tại không
  isCurrentUser(userId: string): boolean {
    if (!userId) return false;
    return this.profileNavigator.isCurrentUser(userId);
  }

  openReportModal(post: Post): void {
    this.reportingPost = post;
    this.showReportModal = true;
    
    // Reset the form
    this.reportForm.reset();
  }
  
  cancelReport(): void {
    this.showReportModal = false;
    this.reportingPost = null;
    this.reportForm.reset();
  }
  
  submitReport(): void {
    if (this.reportForm.invalid || !this.reportingPost) {
      return;
    }
    
    this.isSubmittingReport = true;
    
    const postId = this.reportingPost._id;
    const violationType = this.reportForm.value.violationType;
    const additionalDetails = this.reportForm.value.additionalDetails;
    
    this.reportService.reportPost(postId, violationType, additionalDetails).subscribe({
      next: (response) => {
        this.toastr.success('Báo cáo đã được gửi thành công. Cảm ơn bạn đã góp phần xây dựng cộng đồng!');
        this.cancelReport();
        this.isSubmittingReport = false;
      },
      error: (error) => {
        console.error('Error submitting report:', error);
        if (error.status === 400 && error.error.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại sau.');
        }
        this.isSubmittingReport = false;
      }
    });
  }
} 