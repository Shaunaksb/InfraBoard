from django.db import models
from django.conf import settings
from .organization import Organization
import uuid

class Board(models.Model):
    id = models.CharField(max_length=100, primary_key=True, blank=True)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_boards')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='shared_boards', blank=True)
    organizations = models.ManyToManyField(Organization, related_name='shared_boards', blank=True)

    # Board template config
    fields = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    focusColumns = models.JSONField(default=list, blank=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = f"brd_{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
