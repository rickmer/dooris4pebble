#include <pebble.h>
#include <string.h>

#define TTupletCString(_key, _cstring) \
((const Tuplet) { .type = TUPLE_CSTRING, .key = _key, .cstring = { .data = _cstring, .length = strlen(_cstring) + 1 }})

static Window *window;
static TextLayer *time_layer;
static TextLayer *status_layer;
static TextLayer *title_layer;
static AppSync sync;
static uint8_t sync_buffer[128];

enum MessageKeys{
    EVENTTIME = 1,
    DOORSTATUS = 2,
    SPACEURL = 3,
    SPACENAME = 4
};

static void incomeing_message_callback(const uint32_t key, const Tuple* new_tuple, const Tuple* old_tuple, void* context){
    
    APP_LOG(APP_LOG_LEVEL_DEBUG, new_tuple->value->cstring);

    switch (key) {
    
        case DOORSTATUS:
        text_layer_set_text(status_layer, new_tuple->value->cstring);
        break;

        case EVENTTIME:
        text_layer_set_text(time_layer, new_tuple->value->cstring);
        break;

        case SPACEURL:
        persist_write_string(SPACEURL, new_tuple->value->cstring);
        break;

        case SPACENAME:
        text_layer_set_text(title_layer, new_tuple->value->cstring); 
        persist_write_string(SPACENAME, new_tuple->value->cstring);
        break;
    }

}

static void error_message_callback(DictionaryResult dict_error, AppMessageResult app_message_error, void *context){
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Sync Error: %d", app_message_error);
}

static void send_msg(void) {
  
  char url[128];
  if (persist_exists(SPACEURL)) {
    persist_read_string(SPACEURL, url, sizeof(url));
    APP_LOG(APP_LOG_LEVEL_DEBUG, "The url is: %s", url);
  } 

  char name[128];
  if (persist_exists(SPACENAME)) {
    persist_read_string(SPACENAME, name, sizeof(name));
    APP_LOG(APP_LOG_LEVEL_DEBUG, "The name is: %s", name);
  } 

  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  if (iter == NULL) {
    return;
  }

  dict_write_cstring(iter, SPACEURL, url);
  dict_write_cstring(iter, SPACENAME, name);
  dict_write_end(iter);

  app_message_outbox_send();
}

static void select_click_handler(ClickRecognizerRef recognizer, void *context) { 
  text_layer_set_text(status_layer, "...");
  text_layer_set_text(time_layer, "...");
  send_msg();
}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  title_layer = text_layer_create((GRect) { .origin = { 0, 8 }, .size = { bounds.size.w, 32 } });
  text_layer_set_text_alignment(title_layer, GTextAlignmentCenter);
  text_layer_set_font(title_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
  layer_add_child(window_layer, text_layer_get_layer(title_layer));
  text_layer_set_text(title_layer, "Dooris Status");
  
  status_layer = text_layer_create((GRect) { .origin = { 0, 50 }, .size = { bounds.size.w, 32 } });
  text_layer_set_text_alignment(status_layer, GTextAlignmentCenter);
  text_layer_set_font(status_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
  layer_add_child(window_layer, text_layer_get_layer(status_layer));

  time_layer = text_layer_create((GRect) { .origin = { 0, 85 }, .size = { bounds.size.w, 32 } });
  text_layer_set_text_alignment(time_layer, GTextAlignmentCenter);
  text_layer_set_font(time_layer, fonts_get_system_font(FONT_KEY_GOTHIC_28_BOLD));
  layer_add_child(window_layer, text_layer_get_layer(time_layer));
  
  char name[128];
  if (persist_exists(SPACENAME)) {
    persist_read_string(SPACENAME, name, sizeof(name));
    APP_LOG(APP_LOG_LEVEL_DEBUG, "The name is: %s", name);
  } else {
    strcpy(name, "");
  }

  char url[128];
  if (persist_exists(SPACEURL)) {
    persist_read_string(SPACEURL, url, sizeof(url));
    APP_LOG(APP_LOG_LEVEL_DEBUG, "The url is: %s", url);
  } else {
    strcpy(url, "");
  }

  Tuplet initial_values[] = {
        TupletCString(EVENTTIME, ""),
        TupletCString(DOORSTATUS, ""),
        TTupletCString(SPACEURL, url),
        TTupletCString(SPACENAME, name)
  };

  app_sync_init(&sync, sync_buffer, sizeof(sync_buffer), initial_values, ARRAY_LENGTH(initial_values), incomeing_message_callback, error_message_callback, NULL);
  send_msg();

}

static void window_unload(Window *window) {
  app_sync_deinit(&sync);
  text_layer_destroy(time_layer);
  text_layer_destroy(status_layer);
  text_layer_destroy(title_layer);
}

static void init(void) {
  window = window_create();
  window_set_click_config_provider(window, click_config_provider);
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  
  const int inbound_size = 128;
  const int outbound_size = 128;
  app_message_open(inbound_size, outbound_size);
  
  const bool animated = true;
  window_stack_push(window, animated);
}

static void deinit(void) {
  window_destroy(window);
}

int main(void) {
  init();
  
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);
  app_event_loop();
  deinit();
}
