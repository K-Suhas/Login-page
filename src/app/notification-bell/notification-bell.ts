import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../Service/NotificationService';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.html',
  styleUrls: ['./notification-bell.css']
})
export class NotificationBellComponent implements OnInit {
  notifications: any[] = [];
  showDropdown = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.getAll().subscribe({
      next: data => {
        console.log("Notifications from backend:", data);
        this.notifications = data;
      },
      error: err => console.error('Failed to load notifications', err)
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  hasUnread(): boolean {
    return this.notifications.some(n => !n.read);
  }

  unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // ✅ Add this method
  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications = this.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        );
      },
      error: err => console.error('Failed to mark notification as read', err)
    });
  }
}
