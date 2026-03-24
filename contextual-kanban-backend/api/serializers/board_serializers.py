from rest_framework import serializers
from api.models import Board, Column
from .card_serializers import CardSerializer

class ColumnSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)

    class Meta:
        model = Column
        fields = ['id', 'title', 'order', 'cards', 'board']
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
            Column.objects.create(board=board, title=title, order=order)
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
