from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    preferences = models.JSONField(default=dict, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def save(self, *args, **kwargs):
        if not self.id or not str(self.id).startswith('usr_'):
            self.id = f"usr_{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email or self.username
