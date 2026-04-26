using MathVoyager.Models;

namespace MathVoyager.Data;

public interface IContentRepository
{
    Task<List<Topic>> GetTopicsAsync();
    Task<List<Topic>> GetTopicsByDomainAsync(string domainId);
    Task<List<Domain>> GetDomainsAsync();
    Task<Topic?> GetTopicAsync(string topicId);
    Task<List<Lesson>> GetLessonsAsync(string topicId);
    Task<Lesson?> GetLessonAsync(string topicId, string lessonId);
    Task<List<Question>> GetQuestionsAsync(string topicId);
    Task<List<Question>> GetQuestionsForLessonAsync(string topicId, string lessonId);
    Task<List<Question>> GetMasteryQuestionsAsync(string topicId);
    Task<List<SynthesisQuiz>> GetSynthesisQuizzesAsync();
    Task<SynthesisQuiz?> GetSynthesisQuizAsync(string id);
}
