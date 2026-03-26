import re
from django.db import models
from .board import Board

class Column(models.Model):
    TOOL_CHOICES = [
        ('none',           'None'),
        ('docker',         'Docker'),
        ('kubernetes',     'Kubernetes'),
        ('terraform',      'Terraform'),
        ('github_actions', 'GitHub Actions'),
        ('aws',            'AWS'),
        ('gcp',            'GCP'),
        ('prometheus',     'Prometheus'),
        ('grafana',        'Grafana'),
    ]
    id = models.CharField(max_length=100, primary_key=True, blank=True)
    title = models.CharField(max_length=255)
    tool_type = models.CharField(max_length=50, choices=TOOL_CHOICES, default='none')
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='columns')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def save(self, *args, **kwargs):
        if not self.id:
            # Generate ID: board_id + slugified title to ensure uniqueness across boards
            slug = re.sub(r'\s+', '-', self.title.lower())
            self.id = f"{self.board_id}-{slug}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
