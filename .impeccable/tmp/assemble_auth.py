p = 'components/ui/auth-card.tsx'
lines = open(p, encoding='utf8').read().split('\n')
# original: imports occupy lines 1-18, logic lines 20..317 (1-indexed), 'return (' at 318
assert lines[317].strip() == 'return (', lines[317]
logic = '\n'.join(lines[19:317])
header = """import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../../src/context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CircleAlert, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import AuthSwitch from './auth-switch';
import './auth-card.css';
"""
render = open('.impeccable/tmp/auth_render.tsx.part', encoding='utf8').read()
open(p, 'w', encoding='utf8').write(header + '\n' + logic + '\n\n' + render)
print('assembled')
