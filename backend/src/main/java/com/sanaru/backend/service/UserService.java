package com.sanaru.backend.service;

import com.sanaru.backend.model.Role;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public long getCustomerCount() {
        return userRepository.countByRole(Role.CUSTOMER);
    }

    public List<User> getAllCustomers() {
        return userRepository.findAllByRoleOrderByIdDesc(Role.CUSTOMER);
    }

    public User blockCustomer(Long customerId) {
        return updateCustomerStatus(customerId, false);
    }

    public User unblockCustomer(Long customerId) {
        return updateCustomerStatus(customerId, true);
    }

    public void deleteCustomer(Long customerId) {
        User customer = userRepository.findByIdAndRole(customerId, Role.CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
        userRepository.delete(customer);
    }

    private User updateCustomerStatus(Long customerId, boolean enabled) {
        User customer = userRepository.findByIdAndRole(customerId, Role.CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));
        customer.setEnabled(enabled);
        return userRepository.save(customer);
    }
}
