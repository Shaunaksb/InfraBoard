from django.db import models
from django.conf import settings
import uuid

class Template(models.Model):
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    columns = models.JSONField(default=list)
    fields = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='templates')

    def save(self, *args, **kwargs):
        if not self.id or not str(self.id).startswith('tpl_'):
            self.id = f"tpl_{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
