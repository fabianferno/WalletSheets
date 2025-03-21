'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Checkbox from '@/components/ui/Checkbox';
import { useState } from 'react';

export default function ComponentsPage() {
    const [formValues, setFormValues] = useState({
        name: '',
        email: '',
        agreeToTerms: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Component Library</h1>
                <p className="text-gray-600 mb-12">A Google Sheets-like UI component kit with green accents</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Buttons */}
                    <Card
                        title="Buttons"
                        subtitle="Various button styles and sizes"
                        bordered
                        elevated
                    >
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium mb-3">Button Variants</h3>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="primary">Primary</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="text">Text</Button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-3">Button Sizes</h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button size="sm">Small</Button>
                                    <Button size="md">Medium</Button>
                                    <Button size="lg">Large</Button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-3">Button States</h3>
                                <div className="flex flex-wrap gap-3">
                                    <Button disabled>Disabled</Button>
                                    <Button isLoading>Loading</Button>
                                    <Button fullWidth>Full Width</Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Inputs */}
                    <Card
                        title="Inputs"
                        subtitle="Text fields and form controls"
                        bordered
                        elevated
                    >
                        <div className="space-y-6">
                            <Input
                                label="Name"
                                placeholder="Enter your name"
                                name="name"
                                value={formValues.name}
                                onChange={handleChange}
                            />

                            <Input
                                label="Email"
                                placeholder="Enter your email"
                                type="email"
                                hint="We'll never share your email with anyone else."
                                name="email"
                                value={formValues.email}
                                onChange={handleChange}
                            />

                            <Input
                                label="Password"
                                placeholder="Enter your password"
                                type="password"
                                error="Password must be at least 8 characters"
                            />

                            <Checkbox
                                label="I agree to the terms and conditions"
                                description="By checking this box, you agree to our Terms of Service and Privacy Policy."
                                name="agreeToTerms"
                                checked={formValues.agreeToTerms}
                                onChange={handleChange}
                            />
                        </div>
                    </Card>

                    {/* Cards */}
                    <Card
                        title="Cards"
                        subtitle="Content containers with different styles"
                        bordered
                        elevated
                    >
                        <div className="space-y-6">
                            <Card bordered>
                                <h3 className="text-lg font-medium mb-2">Bordered Card</h3>
                                <p className="text-gray-600">
                                    This is a basic card with a border. Cards are useful for grouping related content and actions.
                                </p>
                            </Card>

                            <Card elevated>
                                <h3 className="text-lg font-medium mb-2">Elevated Card</h3>
                                <p className="text-gray-600">
                                    This card has a shadow to create a sense of elevation above the page.
                                </p>
                            </Card>

                            <Card
                                title="Card with Title"
                                footer={<div className="flex justify-end"><Button size="sm">Save</Button></div>}
                                bordered
                                elevated
                            >
                                <p className="text-gray-600">
                                    This card has a title section and a footer area with actions.
                                </p>
                            </Card>
                        </div>
                    </Card>

                    {/* Badges */}
                    <Card
                        title="Badges"
                        subtitle="Status indicators and tags"
                        bordered
                        elevated
                    >
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium mb-3">Badge Variants</h3>
                                <div className="flex flex-wrap gap-3">
                                    <Badge>Default</Badge>
                                    <Badge variant="primary">Primary</Badge>
                                    <Badge variant="success">Success</Badge>
                                    <Badge variant="warning">Warning</Badge>
                                    <Badge variant="danger">Danger</Badge>
                                    <Badge variant="info">Info</Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-3">Badge with Dot</h3>
                                <div className="flex flex-wrap gap-3">
                                    <Badge dot>Default</Badge>
                                    <Badge dot variant="primary">Primary</Badge>
                                    <Badge dot variant="success">Success</Badge>
                                    <Badge dot variant="warning">Warning</Badge>
                                    <Badge dot variant="danger">Danger</Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-3">Badge Sizes</h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge size="sm" variant="primary">Small</Badge>
                                    <Badge size="md" variant="primary">Medium</Badge>
                                    <Badge size="lg" variant="primary">Large</Badge>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Tables */}
                    <Card
                        title="Tables"
                        subtitle="Data tables with a Google Sheets-like appearance"
                        bordered
                        elevated
                        className="col-span-1 md:col-span-2"
                    >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell isHeader>Name</TableCell>
                                    <TableCell isHeader>Email</TableCell>
                                    <TableCell isHeader>Role</TableCell>
                                    <TableCell isHeader align="center">Status</TableCell>
                                    <TableCell isHeader align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>John Doe</TableCell>
                                    <TableCell>john.doe@example.com</TableCell>
                                    <TableCell>Administrator</TableCell>
                                    <TableCell align="center">
                                        <Badge variant="success" dot>Active</Badge>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button size="sm" variant="outline">Edit</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow isSelected>
                                    <TableCell>Jane Smith</TableCell>
                                    <TableCell>jane.smith@example.com</TableCell>
                                    <TableCell>Editor</TableCell>
                                    <TableCell align="center">
                                        <Badge variant="primary" dot>Pending</Badge>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button size="sm" variant="outline">Edit</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Bob Johnson</TableCell>
                                    <TableCell>bob.johnson@example.com</TableCell>
                                    <TableCell>Viewer</TableCell>
                                    <TableCell align="center">
                                        <Badge variant="danger" dot>Inactive</Badge>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button size="sm" variant="outline">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </div>
    );
} 