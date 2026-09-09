#ifndef HHM_CLIENT_H
#define HHM_CLIENT_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct hhm_client {
  const char *base_url;
  const char *token;
} hhm_client;

int hhm_client_endpoint(const hhm_client *client, const char *path,
                        char *output, size_t output_size);

#ifdef __cplusplus
}
#endif

#endif
