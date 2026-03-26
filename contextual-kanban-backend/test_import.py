import sys
try:
    from api.views import board_views
    print("Success")
except Exception as e:
    import traceback
    traceback.print_exc()
