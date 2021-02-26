import { Request, Response } from "express";
import { getCustomRepository, Not, IsNull } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";

class NpsController {
  async execute(request: Request, response: Response) {
    const { survey_id } = request.params;

    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const surveysUsers = await surveysUsersRepository.find({
      survey_id,
      value: Not(IsNull()),
    });

    if (!surveysUsers) {
      throw new AppError("Nothing Survey User answered");
    }

    const detractors = surveysUsers.filter(
      (su) => su.value >= 0 && su.value <= 6
    ).length;
    const promoters = surveysUsers.filter(
      (su) => su.value >= 9 && su.value <= 10
    ).length;
    const passives = surveysUsers.filter((su) => su.value >= 7 && su.value <= 8)
      .length;
    const totalAnswers = surveysUsers.length;

    const calculate = Number(
      (((promoters - detractors) / totalAnswers) * 100).toFixed(2)
    );

    return response.send({
      detractors,
      promoters,
      totalAnswers,
      nps: calculate,
    });
  }
}

export { NpsController };
