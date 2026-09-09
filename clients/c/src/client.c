#include "hhm/client.h"

#include <stdio.h>
#include <string.h>

int hhm_client_endpoint(const hhm_client *client, const char *path,
                        char *output, size_t output_size) {
  if (client == NULL || client->base_url == NULL || path == NULL ||
      output == NULL || output_size == 0) {
    return -1;
  }

  const size_t base_len = strlen(client->base_url);
  const char *separator =
      (base_len > 0 && client->base_url[base_len - 1] == '/') ? "" : "/";
  const int written = snprintf(output, output_size, "%s%s%s", client->base_url,
                               separator, path[0] == '/' ? path + 1 : path);
  return (written < 0 || (size_t)written >= output_size) ? -1 : written;
}
