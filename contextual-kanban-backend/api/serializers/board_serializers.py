from rest_framework import serializers
from api.models import Board, Column
from .card_serializers import CardSerializer

class ColumnSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)

    class Meta:
        model = Column
        fields = ['id', 'title', 'tool_type', 'order', 'cards', 'board']
        extra_kwargs = {'board': {'write_only': True}}

class BoardSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    columns = ColumnSerializer(many=True, read_only=True)
    # Accept a list of column title strings on write (matches frontend BoardConfig.columns)
    column_names = serializers.ListField(
        child=serializers.CharField(max_length=255),
        write_only=True,
        required=False,
        source='_column_names',
    )
    ownerId = serializers.PrimaryKeyRelatedField(read_only=True, source='owner')
    memberIds = serializers.PrimaryKeyRelatedField(many=True, read_only=True, source='members')
    orgIds = serializers.PrimaryKeyRelatedField(many=True, read_only=True, source='organizations')

    class Meta:
        model = Board
        fields = ['id', 'name', 'ownerId', 'memberIds', 'orgIds', 'columns', 'column_names', 'fields', 'tags', 'focusColumns']

    def create(self, validated_data):
        column_titles = validated_data.pop('_column_names', [])
        board = super().create(validated_data)
        for order, title in enumerate(column_titles):
            tool_type = 'none'
            title_lower = title.lower()
            if 'docker' in title_lower or 'container' in title_lower:
                tool_type = 'docker'
            elif 'kubernetes' in title_lower or 'k8s' in title_lower or 'helm' in title_lower:
                tool_type = 'kubernetes'
            elif 'aws' in title_lower or 'eks' in title_lower:
                tool_type = 'aws'
            elif 'gcp' in title_lower or 'gke' in title_lower or 'google' in title_lower:
                tool_type = 'gcp'
            elif 'terraform' in title_lower or 'infra' in title_lower:
                tool_type = 'terraform'
            elif 'github' in title_lower or 'action' in title_lower or 'ci' in title_lower:
                tool_type = 'github_actions'
            elif 'prometheus' in title_lower or 'alert' in title_lower:
                tool_type = 'prometheus'
            elif 'grafana' in title_lower or 'dashboard' in title_lower or 'monitor' in title_lower:
                tool_type = 'grafana'

            Column.objects.create(board=board, title=title, order=order, tool_type=tool_type)
        return board

    def to_representation(self, instance):
        """
        Restructure the serialized data to match the frontend KanbanBoard interface.
        The frontend expects:
        { id: string, columns: [...], config: { name, ownerId, sharedWithUsers, ... } }
        """
        data = super().to_representation(instance)
        
        # Build the config nested object
        config = {
            'name': data.pop('name'),
            'ownerId': data.pop('ownerId', None),
            'sharedWithUsers': data.pop('memberIds', []),
            'sharedWithOrgs': data.pop('orgIds', []),
            'columns': [],
            'fields': data.pop('fields', []),
            'tags': data.pop('tags', []),
            'focusColumns': data.pop('focusColumns', []),
        }
        
        # Determine the base columns text from actual columns, if any
        if data.get('columns'):
            config['columns'] = [c['title'] for c in data['columns']]
        elif hasattr(self, '_validated_data') and self._validated_data.get('_column_names'):
            config['columns'] = self._validated_data['_column_names']
            
        data['config'] = config
        return data
