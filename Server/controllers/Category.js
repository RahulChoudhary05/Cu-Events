const Category = require('../models/Category'); // Ensure correct path to Category model

exports.createCategory = async (req, res) => {
    try {
        const { name, description, type } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: 'Name and type are required',
            });
        }

        if (!['GeneralRegistration', 'HackathonRegistration'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category type. Must be either "GeneralRegistration" or "HackathonRegistration"',
            });
        }

        const categoryDetails = await Category.create({
            name,
            description,
            type,
        });

        console.log(categoryDetails);

        return res.status(200).json({
            success: true,
            message: 'Category created successfully',
            category: categoryDetails,
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to create category. Please try again.',
        });
    }
};
