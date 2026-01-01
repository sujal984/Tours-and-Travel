import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import InquiryButton from '../components/InquiryButton';

const CustomerLayout = () => {
    return (
        <div className="customer-site">
            <Navbar />
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
            <InquiryButton />
            <Footer />
        </div>
    );
};

export default CustomerLayout;
