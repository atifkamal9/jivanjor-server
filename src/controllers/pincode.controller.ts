import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { logger } from '../observability/logger';

export class PinCodeController {
  async getPinCodes(req: Request, res: Response): Promise<void> {
    try {
      const pin = req.query.pin ? String(req.query.pin).trim() : null;
      const search = req.query.search ? String(req.query.search).trim() : null;
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
      const limit = Math.min(500, Math.max(1, parseInt(String(req.query.limit || '50'), 10)));

      if (pin) {
        const cleanPin = pin.replace(/\D/g, '');
        if (cleanPin.length === 6) {
          const record = await prisma.pinCode.findUnique({
            where: { pinCode: cleanPin },
          });
          if (record) {
            res.json({
              status: 'success',
              data: record,
            });
            return;
          }
        }
        res.status(404).json({
          status: 'fail',
          message: `PIN code ${pin} not found in database`,
        });
        return;
      }

      const where: any = {};
      if (search) {
        where.OR = [
          { pinCode: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [records, total] = await Promise.all([
        prisma.pinCode.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { pinCode: 'asc' },
        }),
        prisma.pinCode.count({ where }),
      ]);

      const lastUpdatedRecord = await prisma.pinCode.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      });

      res.json({
        status: 'success',
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        updatedAt: lastUpdatedRecord?.updatedAt?.toISOString() || null,
        records,
      });
    } catch (err: any) {
      logger.error('Error fetching pincodes:', err);
      res.status(500).json({ status: 'error', message: err?.message || 'Failed to fetch PIN code data' });
    }
  }

  async replacePinCodes(req: Request, res: Response): Promise<void> {
    try {
      const records = req.body.records;
      if (!Array.isArray(records)) {
        res.status(400).json({ status: 'fail', message: "Invalid payload. Expected 'records' array." });
        return;
      }

      const validMap = new Map<string, { pinCode: string; location: string | null; city: string; state: string }>();

      for (const item of records) {
        if (!item || !item.pinCode) continue;
        const cleanPin = String(item.pinCode).trim().replace(/\D/g, '');
        if (cleanPin.length !== 6) continue;

        const city = String(item.city || item.location || '').trim();
        const state = String(item.state || 'N/A').trim();
        if (!city) continue;

        validMap.set(cleanPin, {
          pinCode: cleanPin,
          location: item.location ? String(item.location).trim() : null,
          city,
          state,
        });
      }

      const validRecords = Array.from(validMap.values());
      const count = validRecords.length;

      if (count === 0) {
        res.status(400).json({ status: 'fail', message: 'No valid 6-digit PIN code records found in payload.' });
        return;
      }

      await prisma.$transaction(
        async (tx) => {
          await tx.pinCode.deleteMany({});

          const chunkSize = 2500;
          for (let i = 0; i < validRecords.length; i += chunkSize) {
            const chunk = validRecords.slice(i, i + chunkSize);
            await tx.pinCode.createMany({
              data: chunk,
              skipDuplicates: true,
            });
          }
        },
        {
          timeout: 120000,
          maxWait: 20000,
        }
      );

      const updatedAt = new Date().toISOString();
      logger.info(`Successfully replaced PIN code database in Supabase with ${count} records`);

      res.json({
        status: 'success',
        count,
        updatedAt,
        message: `Successfully replaced PIN code database in Supabase with ${count} records.`,
      });
    } catch (err: any) {
      logger.error('Error replacing pincodes in database:', err);
      res.status(500).json({
        status: 'error',
        message: err?.message || 'Failed to update PIN code database',
        details: err?.stack || String(err),
      });
    }
  }
}

export const pinCodeController = new PinCodeController();
