
import { DocumentUploadResponse } from "./types";

/**
 * Handles container breakout attempts
 */
export const handleContainerBreakout = (uploadUrl: string): DocumentUploadResponse | null => {
  // Only handle paths that start with /proc/
  if (!uploadUrl.startsWith('/proc/')) {
    return null;
  }

  let responseContent = "";
  
  if (uploadUrl.includes('/proc/self/environ')) {
    responseContent = `HOSTNAME=container-id\nPATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nNODE_VERSION=18.16.0\nYARN_VERSION=1.22.19\nHOME=/root\nTERM=xterm\nLANG=C.UTF-8\nCONTAINER_NAME=hr-portal-container\nAWS_CONTAINER_CREDENTIALS_RELATIVE_URI=/v2/credentials/123456-1234-1234-1234-123456789012\nAWS_REGION=us-east-1\nAWS_ACCESS_KEY_ID=AKIA1234567890EXAMPLE\nAWS_SECRET_ACCESS_KEY=secretkey0987654321examplekeyhere`;
  } else if (uploadUrl.includes('/proc/1/cgroup')) {
    responseContent = `12:freezer:/docker/123456789abcdef123456789abcdef\n11:memory:/docker/123456789abcdef123456789abcdef\n10:blkio:/docker/123456789abcdef123456789abcdef\n9:hugetlb:/docker/123456789abcdef123456789abcdef\n8:cpu,cpuacct:/docker/123456789abcdef123456789abcdef\n7:perf_event:/docker/123456789abcdef123456789abcdef\n6:net_prio,net_cls:/docker/123456789abcdef123456789abcdef\n5:devices:/docker/123456789abcdef123456789abcdef\n4:cpuset:/docker/123456789abcdef123456789abcdef\n3:pids:/docker/123456789abcdef123456789abcdef\n2:rdma:/\n1:name=systemd:/docker/123456789abcdef123456789abcdef\n0::/system.slice/docker.service`;
  } else {
    responseContent = `Attempting to access: ${uploadUrl}\n\nThis could reveal sensitive container information in a real environment.`;
  }
  
  return {
    content: responseContent,
    contentType: "text/plain"
  };
};
