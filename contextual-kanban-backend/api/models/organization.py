from django.db import models
from django.conf import settings
import uuid

class Organization(models.fields.CharField):
    pass

class Organization(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_organizations')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='organizations', blank=True)

    def save(self, *args, **kwargs):
        if not self.id or not str(self.id).startswith('org_'):
            self.id = f"org_{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
