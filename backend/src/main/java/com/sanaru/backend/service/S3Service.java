package com.sanaru.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    private final S3Client s3Client;
    
    @Value("${AWS_S3_BUCKET_NAME}")
    private String bucketName;
    
    @Value("${AWS_S3_REGION}")
    private String region;

    public S3Service(@Value("${AWS_S3_REGION}") String regionStr) {
        this.s3Client = S3Client.builder()
                .region(Region.of(regionStr))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    public String uploadFile(String folderName, MultipartFile file) throws IOException {
        String fileName = folderName + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Return the public URL of the uploaded file
        return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + fileName;
    }
}
