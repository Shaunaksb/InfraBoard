from rest_framework import serializers
from api.models import User


class UserSerializer(serializers.ModelSerializer):
    """Read serializer — also used for signup input with password + name."""
    name = serializers.CharField(source='first_name', required=False)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'preferences', 'password']
        extra_kwargs = {
            'id': {'read_only': True},
        }

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Build a combined display name from first_name + last_name
        full = f"{instance.first_name} {instance.last_name}".strip()
        ret['name'] = full if full else instance.username
        return ret

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        # DRF maps 'name' → 'first_name' via source, so it's already correct
        user = User(
            email=validated_data.get('email'),
            username=validated_data.get('email'),  # use email as username
            first_name=validated_data.get('first_name', ''),
        )
        if password:
            user.set_password(password)
        user.save()
        return user
