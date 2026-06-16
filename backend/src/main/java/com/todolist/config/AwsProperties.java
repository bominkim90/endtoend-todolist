package com.todolist.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * AWS S3 / CloudFront 설정값
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "aws")
public class AwsProperties {

	private String region;
	private String s3Bucket;
	private String cloudfrontDomain;
	private String accessKeyId;
	private String secretAccessKey;
}
