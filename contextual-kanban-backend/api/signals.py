from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from api.models import Template
from api.utils.default_templates import DEFAULT_TEMPLATES


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def seed_default_templates(sender, instance, created, **kwargs):
    """
    When a new user is created, clone all default templates
    and assign them as that user's personal templates.
    """
    if not created:
        return
    
    for tpl_data in DEFAULT_TEMPLATES:
        Template.objects.create(
            name=tpl_data["name"],
            description=tpl_data["description"],
            icon=tpl_data["icon"],
            columns=tpl_data["columns"],
            fields=tpl_data["fields"],
            tags=tpl_data["tags"],
            tool_type=tpl_data.get("tool_type", ""),
            config_fields=tpl_data.get("config_fields", []),
            owner=instance,
        )


def sync_user_templates(user):
    """
    Synchronize a user's templates with the current DEFAULT_TEMPLATES.
    Updates existing templates and creates missing ones.
    """
    for tpl_data in DEFAULT_TEMPLATES:
        Template.objects.update_or_create(
            owner=user,
            name=tpl_data["name"],
            tool_type=tpl_data.get("tool_type", ""),
            defaults={
                "description": tpl_data["description"],
                "icon": tpl_data["icon"],
                "columns": tpl_data["columns"],
                "fields": tpl_data["fields"],
                "tags": tpl_data["tags"],
                "config_fields": tpl_data.get("config_fields", []),
            }
        )
